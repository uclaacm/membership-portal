/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // db-init runs Sequelize sync before migrations, so this also works when the model
    // has already created the table on a fresh installation.
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "event_reminders" (
        "id" SERIAL PRIMARY KEY,
        "rsvpId" INTEGER NOT NULL REFERENCES "rsvps" ("id") ON DELETE CASCADE,
        "dueAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'pending',
        "attempts" INTEGER NOT NULL DEFAULT 0,
        "sentAt" TIMESTAMP WITH TIME ZONE,
        "lastError" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "event_reminders_rsvp_unique"
        ON "event_reminders" ("rsvpId");
      CREATE INDEX IF NOT EXISTS "event_reminders_due_index"
        ON "event_reminders" ("status", "dueAt");
    `);

    // Preserve existing opt-ins only when the one-hour send time is still ahead.
    await queryInterface.sequelize.query(`
      INSERT INTO "event_reminders" ("rsvpId", "dueAt", "status", "attempts", "createdAt", "updatedAt")
      SELECT r."id", e."startDate" - INTERVAL '1 hour', 'pending', 0, NOW(), NOW()
      FROM "rsvps" r
      JOIN "events" e ON e."uuid" = r."event"
      WHERE r."emailRemindersEnabled" = TRUE
        AND e."startDate" > NOW() + INTERVAL '1 hour'
      ON CONFLICT ("rsvpId") DO NOTHING;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "event_reminders";');
  },
};
