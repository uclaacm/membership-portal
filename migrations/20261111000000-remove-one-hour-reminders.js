/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM "event_reminders"
      WHERE "kind" = 'one_hour' AND "status" <> 'sent';

      ALTER TABLE "event_reminders" ALTER COLUMN "kind" DROP DEFAULT;

      INSERT INTO "event_reminders"
        ("rsvpId", "kind", "dueAt", "status", "attempts", "createdAt", "updatedAt")
      SELECT r."id", 'day_of', day_of."dueAt", 'pending', 0, NOW(), NOW()
      FROM "rsvps" AS r
      JOIN "events" AS e ON e."uuid" = r."event"
      CROSS JOIN LATERAL (
        SELECT (date_trunc('day', e."startDate" AT TIME ZONE 'America/Los_Angeles')
          + INTERVAL '9 hours') AT TIME ZONE 'America/Los_Angeles' AS "dueAt"
      ) AS day_of
      WHERE r."emailRemindersEnabled" = TRUE
        AND day_of."dueAt" > NOW()
        AND day_of."dueAt" < e."startDate"
      ON CONFLICT ("rsvpId", "kind") DO NOTHING;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "event_reminders" ALTER COLUMN "kind" SET DEFAULT 'one_hour';

      INSERT INTO "event_reminders"
        ("rsvpId", "kind", "dueAt", "status", "attempts", "createdAt", "updatedAt")
      SELECT r."id", 'one_hour', e."startDate" - INTERVAL '1 hour',
             'pending', 0, NOW(), NOW()
      FROM "rsvps" AS r
      JOIN "events" AS e ON e."uuid" = r."event"
      WHERE r."emailRemindersEnabled" = TRUE
        AND e."startDate" > NOW() + INTERVAL '1 hour'
      ON CONFLICT ("rsvpId", "kind") DO NOTHING;
    `);
  },
};
