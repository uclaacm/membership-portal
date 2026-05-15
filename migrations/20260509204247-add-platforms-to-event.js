/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn('events', 'platforms', {
    //   type: Sequelize.ARRAY(Sequelize.STRING),
    //   allowNull: false,
    //   defaultValue: [],
    //   ifNotExists: true,
    // });
    await queryInterface.sequelize.query(`
      ALTER TABLE "events"
      ADD COLUMN IF NOT EXISTS "platforms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'platforms');
  },
};
