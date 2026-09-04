/**
 * Adds the optional attendee ceiling to events.
 *
 * Nullable on purpose: most events have no meaningful limit, and null has to stay
 * distinguishable from 0 so a card can fall back to "42 RSVPs" with no denominator.
 * Advisory only — nothing in the API blocks an RSVP past this number.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "capacity" INTEGER;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "events" DROP COLUMN IF EXISTS "capacity";
    `);
  },
};
