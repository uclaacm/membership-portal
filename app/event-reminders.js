const ONE_HOUR_MS = 60 * 60 * 1000;

// Keep pending reminders in sync with an event's start time. Sent reminders are
// deliberately left alone so a reschedule cannot send a second email.
async function reconcileEventReminders(db, eventUuid, startDate, transaction) {
  const dueAt = new Date(new Date(startDate).getTime() - ONE_HOUR_MS);
  if (dueAt <= new Date()) {
    await db.query(`
      DELETE FROM "event_reminders" AS reminder
      USING "rsvps" AS rsvp
      WHERE reminder."rsvpId" = rsvp."id"
        AND rsvp."event" = :eventUuid
        AND reminder."status" = 'pending';
    `, { replacements: { eventUuid }, transaction });
    return;
  }

  // This also creates reminders for opted-in RSVPs made when the event was
  // within its final hour but has since been moved farther into the future.
  await db.query(`
    INSERT INTO "event_reminders"
      ("rsvpId", "dueAt", "status", "attempts", "createdAt", "updatedAt")
    SELECT rsvp."id", :dueAt, 'pending', 0, NOW(), NOW()
    FROM "rsvps" AS rsvp
    WHERE rsvp."event" = :eventUuid
      AND rsvp."emailRemindersEnabled" = TRUE
    ON CONFLICT ("rsvpId") DO UPDATE
      SET "dueAt" = EXCLUDED."dueAt", "updatedAt" = NOW()
      WHERE "event_reminders"."status" = 'pending';
  `, { replacements: { eventUuid, dueAt }, transaction });
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

module.exports = { reconcileEventReminders, clearUnsentEventReminders };
