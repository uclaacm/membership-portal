module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('auditLogs', 'detail', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    // Fail rather than silently discard audit evidence if longer entries exist.
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM "auditLogs" WHERE length(detail) > 255) THEN
          RAISE EXCEPTION 'Cannot shrink audit detail: entries exceed 255 characters';
        END IF;
      END $$;
      ALTER TABLE "auditLogs" ALTER COLUMN detail TYPE VARCHAR(255);
    `);
  },
};
