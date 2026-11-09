/**
 * Adds non-secret configuration alongside a stored secret, and relaxes the hash requirement.
 *
 * The email notification settings need somewhere to keep transport, host and from-address.
 * They belong with the credential rather than in a new table, and the credential itself stays
 * in `hash` — `meta` must never hold a token.
 *
 * `hash` becomes nullable because a settings row can legitimately exist before a credential
 * does: transport "none", or a from-address saved ahead of the token.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "secrets" ADD COLUMN IF NOT EXISTS "meta" TEXT;
      ALTER TABLE "secrets" ALTER COLUMN "hash" DROP NOT NULL;
    `);
  },

  async down(queryInterface) {
    // Rows with a null hash would block restoring NOT NULL, so they are cleared first.
    await queryInterface.sequelize.query(`
      DELETE FROM "secrets" WHERE "hash" IS NULL;
      ALTER TABLE "secrets" ALTER COLUMN "hash" SET NOT NULL;
      ALTER TABLE "secrets" DROP COLUMN IF EXISTS "meta";
    `);
  },
};
