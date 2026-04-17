/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "events"
      ALTER COLUMN "description" DROP NOT NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "events"
      SET "description" = ''
      WHERE "description" IS NULL;

      ALTER TABLE "events"
      ALTER COLUMN "description" SET NOT NULL;
    `);
  },
};
