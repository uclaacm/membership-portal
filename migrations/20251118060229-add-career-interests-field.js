/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'careerInterests', {
      type: Sequelize.JSONB,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'careerInterests');
  },
};
