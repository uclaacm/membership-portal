// Keep the schedule in one place for RSVP creation, event edits, and the worker.
// Day-of reminders go out at 9 AM Los Angeles time if the event has not started.
function reminderScheduleSql(startDate) {
  const dayOf = `(date_trunc('day', ${startDate} AT TIME ZONE 'America/Los_Angeles')
    + INTERVAL '9 hours') AT TIME ZONE 'America/Los_Angeles'`;
  return `
    (VALUES
      ('one_week', ${startDate} - INTERVAL '7 days'),
      ('three_days', ${startDate} - INTERVAL '3 days'),
      ('one_day', ${startDate} - INTERVAL '1 day'),
      ('day_of', ${dayOf})
    )`;
}

async function scheduleRsvpReminders(db, rsvpId, transaction) {
  await db.query(`
    INSERT INTO "event_reminders"
      ("rsvpId", "kind", "dueAt", "status", "attempts", "createdAt", "updatedAt")
    SELECT r."id", schedule.kind, schedule."dueAt", 'pending', 0, NOW(), NOW()
    FROM "rsvps" AS r
    JOIN "events" AS e ON e."uuid" = r."event"
    CROSS JOIN LATERAL ${reminderScheduleSql('e."startDate"')} AS schedule(kind, "dueAt")
    WHERE r."id" = :rsvpId
      AND r."emailRemindersEnabled" = TRUE
      AND schedule."dueAt" > NOW()
      AND schedule."dueAt" < e."startDate"
    ON CONFLICT ("rsvpId", "kind") DO NOTHING;
  `, { replacements: { rsvpId }, transaction });
}

// Sent reminders stay sent after a reschedule. Unsent times are rebuilt.
async function reconcileEventReminders(db, eventUuid, transaction) {
  await db.query(`
    DELETE FROM "event_reminders" AS reminder
    USING "rsvps" AS rsvp
    WHERE reminder."rsvpId" = rsvp."id"
      AND rsvp."event" = :eventUuid
      AND reminder."status" = 'pending';
  `, { replacements: { eventUuid }, transaction });

  await db.query(`
    INSERT INTO "event_reminders"
      ("rsvpId", "kind", "dueAt", "status", "attempts", "createdAt", "updatedAt")
    SELECT r."id", schedule.kind, schedule."dueAt", 'pending', 0, NOW(), NOW()
    FROM "rsvps" AS r
    JOIN "events" AS e ON e."uuid" = r."event"
    CROSS JOIN LATERAL ${reminderScheduleSql('e."startDate"')} AS schedule(kind, "dueAt")
    WHERE r."event" = :eventUuid
      AND r."emailRemindersEnabled" = TRUE
      AND schedule."dueAt" > NOW()
      AND schedule."dueAt" < e."startDate"
    ON CONFLICT ("rsvpId", "kind") DO NOTHING;
  `, { replacements: { eventUuid }, transaction });
}

// Event deletion does not delete RSVPs, so explicitly remove unsent reminders.
async function clearUnsentEventReminders(db, eventUuid, transaction) {
  await db.query(`
    DELETE FROM "event_reminders" AS reminder
    USING "rsvps" AS rsvp
    WHERE reminder."rsvpId" = rsvp."id"
      AND rsvp."event" = :eventUuid
      AND reminder."status" <> 'sent';
  `, { replacements: { eventUuid }, transaction });
}

module.exports = {
  reminderScheduleSql, scheduleRsvpReminders, reconcileEventReminders, clearUnsentEventReminders,
};
