const { db } = require('../app/db');
const { getReminderMailConfig, sendEventReminder } = require('../app/reminder-mail');
const { reminderScheduleSql } = require('../app/event-reminders');

const POLL_MS = 60 * 1000;
const BATCH_SIZE = 50;
let stopping = false;
let wake = null;

function pause(ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { wake = null; resolve(); }, ms);
    wake = () => { clearTimeout(timer); wake = null; resolve(); };
  });
}

function stop() {
  stopping = true;
  if (wake) wake();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

// The update and row lock are one statement, so parallel workers cannot claim the same row.
// A claim left behind by a crash can be taken again after five minutes.
async function claimDueReminder() {
  const [rows] = await db.query(`
    WITH candidate AS (
      SELECT "id" FROM "event_reminders"
      WHERE "dueAt" <= NOW()
        AND "kind" <> 'one_hour'
        AND (
          ("status" = 'pending' AND ("nextAttemptAt" IS NULL OR "nextAttemptAt" <= NOW()))
          OR ("status" = 'sending' AND "claimedAt" < NOW() - INTERVAL '5 minutes')
        )
      ORDER BY "dueAt", "id"
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE "event_reminders" AS reminder
    SET "status" = 'sending', "attempts" = reminder."attempts" + 1,
        "claimedAt" = NOW(), "nextAttemptAt" = NULL, "updatedAt" = NOW()
    FROM candidate
    WHERE reminder."id" = candidate."id"
    RETURNING reminder."id", reminder."attempts";
  `);
  return rows[0] || null;
}

async function processReminder(claim) {
  const replacements = { id: claim.id, attempts: claim.attempts };
  const [rows] = await db.query(`
    SELECT reminder."dueAt", reminder."kind", schedule."dueAt" AS "expectedDueAt",
           r."emailRemindersEnabled", u."email", u."state",
           e."title", e."location", e."startDate"
    FROM "event_reminders" AS reminder
    LEFT JOIN "rsvps" AS r ON r."id" = reminder."rsvpId"
    LEFT JOIN "users" AS u ON u."uuid" = r."user"
    LEFT JOIN "events" AS e ON e."uuid" = r."event"
    LEFT JOIN LATERAL ${reminderScheduleSql('e."startDate"')}
      AS schedule(kind, "dueAt") ON schedule.kind = reminder."kind"
    WHERE reminder."id" = :id;
  `, { replacements });
  const target = rows[0];
  if (!target) return; // RSVP cancellation may have cascaded to the reminder.

  const start = target.startDate && new Date(target.startDate);
  if (!target.emailRemindersEnabled || !target.email || target.state !== 'ACTIVE'
      || !start || start <= new Date()) {
    await db.query(`
      DELETE FROM "event_reminders"
      WHERE "id" = :id AND "attempts" = :attempts AND "status" = 'sending';
    `, { replacements });
    return;
  }

  const dueAt = target.expectedDueAt && new Date(target.expectedDueAt);
  const now = new Date();
  if (!dueAt || dueAt >= start
      || (dueAt.getTime() !== new Date(target.dueAt).getTime() && dueAt <= now)) {
    // A reschedule never sends a stage after its new send time has passed.
    await db.query(`
      DELETE FROM "event_reminders"
      WHERE "id" = :id AND "attempts" = :attempts AND "status" = 'sending';
    `, { replacements });
    return;
  }
  if (dueAt > now) {
    // The event moved while this reminder was claimed.
    await db.query(`
      UPDATE "event_reminders"
      SET "status" = 'pending', "dueAt" = :dueAt, "attempts" = 0, "claimedAt" = NULL,
          "nextAttemptAt" = NULL, "lastError" = NULL, "updatedAt" = NOW()
      WHERE "id" = :id AND "attempts" = :attempts AND "status" = 'sending';
    `, { replacements: { ...replacements, dueAt } });
    return;
  }

  try {
    await sendEventReminder({ to: target.email, event: target, kind: target.kind });
  } catch (err) {
    const reason = String(err.code || err.name || 'SMTP error').slice(0, 120);
    const delayMinutes = Math.min(30, 2 ** Math.min(claim.attempts - 1, 10));
    await db.query(`
      UPDATE "event_reminders"
      SET "status" = 'pending', "claimedAt" = NULL, "nextAttemptAt" = :nextAttemptAt,
          "lastError" = :reason, "updatedAt" = NOW()
      WHERE "id" = :id AND "attempts" = :attempts AND "status" = 'sending';
    `, {
      replacements: {
        ...replacements,
        nextAttemptAt: new Date(Date.now() + delayMinutes * 60 * 1000),
        reason,
      },
    });
    console.error(`Event reminder ${claim.id} failed (${reason}); retry in ${delayMinutes} minute(s).`);
    return;
  }

  await db.query(`
    UPDATE "event_reminders"
    SET "status" = 'sent', "sentAt" = NOW(), "claimedAt" = NULL,
        "nextAttemptAt" = NULL, "lastError" = NULL, "updatedAt" = NOW()
    WHERE "id" = :id AND "attempts" = :attempts AND "status" = 'sending';
  `, { replacements });
  console.log(`Sent event reminder ${claim.id}.`);
}

async function runBatch() {
  let processed = 0;
  while (!stopping && processed < BATCH_SIZE) {
    const claim = await claimDueReminder();
    if (!claim) break;
    await processReminder(claim);
    processed += 1;
  }
  return processed;
}

async function main() {
  const once = process.argv.includes('--once');
  let reportedMissingConfig = false;
  try {
    while (!stopping) {
      if (!getReminderMailConfig().configured) {
        if (once) throw new Error('Reminder SMTP is not configured.');
        if (!reportedMissingConfig) {
          console.warn('Reminder SMTP is not configured; worker is waiting.');
          reportedMissingConfig = true;
        }
        await pause(POLL_MS);
        continue;
      }
      reportedMissingConfig = false;
      try {
        const processed = await runBatch();
        if (once) {
          if (processed === 0) console.log('No due event reminders.');
          break;
        }
        if (processed === BATCH_SIZE) continue;
      } catch (err) {
        console.error('Reminder worker cycle failed:', err);
        if (once) throw err;
      }
      await pause(POLL_MS);
    }
  } finally {
    await db.close();
  }
}

main().catch((err) => {
  console.error('Reminder worker stopped:', err);
  process.exitCode = 1;
});
