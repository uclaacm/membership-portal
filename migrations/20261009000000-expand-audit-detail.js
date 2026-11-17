module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('auditLogs', 'detail', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down() {
    // Must exist for rollback; left empty on purpose.
  },
};
