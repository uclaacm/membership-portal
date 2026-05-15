/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'platforms', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'platforms');
  },
};
