const Sequelize = require('sequelize');

// Maps frontend role labels to the accessType values stored in the DB.
// The frontend uses "MEMBER" but the DB stores "STANDARD".
const ROLE_MAP = {
  MEMBER: 'STANDARD',
  OFFICER: 'OFFICER',
  ADMIN: 'ADMIN',
};

/**
 * Builds a Sequelize `where` clause for the admin leaderboard based on the
 * caller's role and any query-string filters (?year, ?role, ?committee).
 *
 * Permission model:
 *   - Officers can only see STANDARD members and may filter by year.
 *   - Admins can see all users and may filter by year, role, and committee.
 *   - Role and committee filters sent by officers are silently ignored.
 */
function buildAdminLeaderboardQuery(query, caller) {
  const where = {};
  const isAdmin = caller.isAdmin();

  // Officers are restricted to viewing STANDARD members only
  if (!isAdmin) {
    where.accessType = 'STANDARD';
  }

  const year = parseInt(query.year, 10);
  if (!Number.isNaN(year) && year >= 1 && year <= 5) {
    where.year = year;
  }

  if (isAdmin && query.role && ROLE_MAP[query.role]) {
    where.accessType = ROLE_MAP[query.role];
  }

  if (isAdmin && query.committee) {
    where.committees = { [Sequelize.Op.contains]: [query.committee] };
  }

  return where;
}

module.exports = { buildAdminLeaderboardQuery, ROLE_MAP };
