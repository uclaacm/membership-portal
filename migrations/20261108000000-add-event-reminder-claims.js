/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // db-init syncs new installations before migrations run.
    await queryInterface.sequelize.query(`
      ALTER TABLE "event_reminders"
        ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "nextAttemptAt" TIMESTAMP WITH TIME ZONE;
      CREATE INDEX IF NOT EXISTS "event_reminders_claim_index"
        ON "event_reminders" ("status", "claimedAt");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "event_reminders_claim_index";
      ALTER TABLE "event_reminders"
        DROP COLUMN IF EXISTS "claimedAt",
        DROP COLUMN IF EXISTS "nextAttemptAt";
    `);
  },
};
