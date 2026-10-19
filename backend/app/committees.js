const mongoose = require('mongoose');
const { Committee } = require('./api/v1/internship/models/Committee');

/**
 * The committee list lives in the Committee collection and nowhere else. Officer assignment,
 * event ownership and every UI filter read it from there, so a committee created in the admin
 * UI is immediately usable everywhere without a code change. Committees are referenced by
 * `name`, which is immutable once created; `displayName` is the editable label.
 */

/**
 * Sentinel used by `event.committee` to mean "general, chapter-wide" rather than owned by any
 * one committee. It is deliberately not a Committee record: nobody can be an officer of 'ACM'.
 */
const GENERAL_COMMITTEE = 'ACM';

/**
 * Every committee name. Throws when Mongo is unreachable rather than falling back to a stale
 * list, so a validator never accepts a name that doesn't exist.
 */
async function getCommitteeNames() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Committee list is unavailable: the internship database is not connected.');
  }
  return Committee.find({}).distinct('name');
}

/** Names in `names` that are not existing committees. */
async function findUnknownCommittees(names) {
  const valid = await getCommitteeNames();
  return names.filter((name) => !valid.includes(name));
}

module.exports = {
  GENERAL_COMMITTEE, getCommitteeNames, findUnknownCommittees,
};
