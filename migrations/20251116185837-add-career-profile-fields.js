/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // IF NOT EXISTS makes this safe on a DB where db.sync() already created these columns
      await queryInterface.sequelize.query(`
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "linkedinUrl" VARCHAR(255);
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "githubUrl" VARCHAR(255);
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "portfolioUrl" VARCHAR(255);
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "personalWebsite" VARCHAR(255);
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resumeUrl" VARCHAR(255);
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "skills" JSONB DEFAULT '[]';
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isProfilePublic" BOOLEAN DEFAULT false;
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pronouns" VARCHAR(255);
      `, { transaction });

      await queryInterface.sequelize.query(
        'CREATE INDEX IF NOT EXISTS "users_is_profile_public" ON "users" ("isProfilePublic");',
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('users', 'bio', { transaction });
      await queryInterface.removeColumn('users', 'linkedinUrl', { transaction });
      await queryInterface.removeColumn('users', 'githubUrl', { transaction });
      await queryInterface.removeColumn('users', 'portfolioUrl', { transaction });
      await queryInterface.removeColumn('users', 'personalWebsite', { transaction });
      await queryInterface.removeColumn('users', 'resumeUrl', { transaction });
      await queryInterface.removeColumn('users', 'skills', { transaction });
      await queryInterface.removeColumn('users', 'isProfilePublic', { transaction });
      await queryInterface.removeColumn('users', 'pronouns', { transaction });
      await queryInterface.removeIndex('users', ['isProfilePublic'], { transaction });
    });
  },
};
