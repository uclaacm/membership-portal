const { COMMITTEES } = require('../../../committees');
const { Committee } = require('./models/Committee');

/**
 * Ensures the internship Committee collection has one document per canonical committee in
 * app/committees.js.
 *
 * The canonical list only ever validated `user.committees` on the Postgres side, so the Mongo
 * collection behind the internship portal was populated solely by app/db/dev-setup.js — which
 * is gated on config.isDevelopment and therefore never fires on prod. That left prod with zero
 * committees and no way to get them short of creating each one by hand in the admin panel.
 * Running this on every boot makes the hardcoded list the source of truth for both sides:
 * adding a name to COMMITTEES is all it takes to create the committee everywhere.
 *
 * Only insertion is driven from the list. Everything an officer edits — description, custom
 * questions, intern limit, deadline, and whether recruitment is open — is left alone on
 * committees that already exist, so this can run on every boot without reverting their work.
 *
 * Deliberately one-way: a committee dropped from COMMITTEES is NOT removed here. Deleting one
 * cascades into every application that chose it, which is not something a deploy should do on
 * its own.
 */
async function syncCommittees() {
  await Promise.all(COMMITTEES.map((name) => Committee.updateOne(
    { name },
    {
      $setOnInsert: {
        name,
        displayName: name,
        // New committees start closed. A fresh database would otherwise come up with every
        // committee accepting applications, which reads to members as "recruitment is open".
        isActive: false,
      },
    },
    { upsert: true },
  )));
}

module.exports = { syncCommittees };
