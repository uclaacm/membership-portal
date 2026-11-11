/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "event_reminders"
        ADD COLUMN IF NOT EXISTS "kind" VARCHAR(16) NOT NULL DEFAULT 'one_hour';
      DROP INDEX IF EXISTS "event_reminders_rsvp_unique";
      CREATE UNIQUE INDEX IF NOT EXISTS "event_reminders_rsvp_kind_unique"
        ON "event_reminders" ("rsvpId", "kind");
    `);

    // Legacy one-hour rows keep their label until the next migration removes
    // unsent ones. Add future stages for existing opt-ins.
    await queryInterface.sequelize.query(`
      INSERT INTO "event_reminders"
        ("rsvpId", "kind", "dueAt", "status", "attempts", "createdAt", "updatedAt")
      SELECT r."id", schedule.kind, schedule."dueAt", 'pending', 0, NOW(), NOW()
      FROM "rsvps" AS r
      JOIN "events" AS e ON e."uuid" = r."event"
      CROSS JOIN LATERAL (
        VALUES
          ('one_week', e."startDate" - INTERVAL '7 days'),
          ('three_days', e."startDate" - INTERVAL '3 days'),
          ('one_day', e."startDate" - INTERVAL '1 day'),
          ('day_of', (date_trunc('day', e."startDate" AT TIME ZONE 'America/Los_Angeles')
            + INTERVAL '9 hours') AT TIME ZONE 'America/Los_Angeles')
      ) AS schedule(kind, "dueAt")
      WHERE r."emailRemindersEnabled" = TRUE
        AND schedule."dueAt" > NOW()
        AND schedule."dueAt" < e."startDate"
      ON CONFLICT ("rsvpId", "kind") DO NOTHING;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM "event_reminders" WHERE "kind" <> 'one_hour';
      DROP INDEX IF EXISTS "event_reminders_rsvp_kind_unique";
      ALTER TABLE "event_reminders" DROP COLUMN IF EXISTS "kind";
      CREATE UNIQUE INDEX IF NOT EXISTS "event_reminders_rsvp_unique"
        ON "event_reminders" ("rsvpId");
    `);
  },
};
