/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "careerInterests" JSONB DEFAULT \'[]\';',
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'careerInterests');
  },
};
