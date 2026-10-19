module.exports = {
  async up(queryInterface) {
    // Add OFFICER to the accessType enum.
    // PostgreSQL doesn't support removing enum values, so this is intentionally
    // not reversed in the down migration.
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_users_accessType" ADD VALUE IF NOT EXISTS \'OFFICER\'',
    );

    // Add committees column — IF NOT EXISTS so db.sync() creating it first is safe
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "committees" text[] NOT NULL DEFAULT '{}';
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'committees');
    // NOTE: PostgreSQL does not support removing values from an enum type.
    // To fully revert the enum change, the type would need to be recreated manually.
  },
};
