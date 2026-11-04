/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Existing RSVPs stay opted out; only a new explicit choice enables reminders.
    await queryInterface.sequelize.query(`
      ALTER TABLE "rsvps"
        ADD COLUMN IF NOT EXISTS "emailRemindersEnabled" BOOLEAN NOT NULL DEFAULT FALSE;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "rsvps" DROP COLUMN IF EXISTS "emailRemindersEnabled";
    `);
  },
};
