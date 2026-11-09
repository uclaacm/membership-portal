/**
 * Retire the legacy "Game" committee in favour of "Studio".
 *
 * Commit 229f906 replaced 'Game' with 'Cloud' in the user model's validCommittees array but
 * did not migrate the rows that already referenced it. Those users have been unwritable ever
 * since: the validator runs on every update, so even the lastActiveAt touch fails for them.
 *
 * Game-dev activity now lives under Studio, so that is the mapping.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    // DISTINCT collapses the duplicate that would appear for anyone already in Studio.
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET "committees" = ARRAY(
        SELECT DISTINCT unnest(array_replace("committees", 'Game', 'Studio'))
      )
      WHERE 'Game' = ANY("committees");
    `);

    // No events currently use it, but this keeps the column consistent if one appears
    // between writing and running this migration.
    await queryInterface.sequelize.query(`
      UPDATE "events" SET "committee" = 'Studio' WHERE "committee" = 'Game';
    `);
  },

  async down() {
    // Deliberately a no-op. The mapping is lossy: once Game has become Studio there is no way
    // to tell which Studio members were originally Game, and re-introducing 'Game' would put
    // the rows back into the unwritable state this migration exists to fix.
  },
};
