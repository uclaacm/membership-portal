/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "events"
      ADD COLUMN IF NOT EXISTS "eventGroupId" UUID;

      CREATE INDEX IF NOT EXISTS "events_event_group_id_index"
      ON "events" ("eventGroupId");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "events_event_group_id_index";

      ALTER TABLE "events"
      DROP COLUMN IF EXISTS "eventGroupId";
    `);
  },
};
