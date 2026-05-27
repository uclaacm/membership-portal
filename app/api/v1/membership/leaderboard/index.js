const express = require('express');
const error = require('../../../../error');
const { User, Attendance } = require('../../../../db');
const { isOfficerOrAdmin } = require('../../auth');
const { buildAdminLeaderboardQuery } = require('./admin-filters');

const router = express.Router();

/**
 * Get the leaderboard.
 *
 * It returns an ordered list of public user profiles by descending number of points.
 * It also supports pagination using 'offset' and 'limit' query parameters
 */
router.route('/').get((req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  const offset = parseInt(req.query.offset, 10);
  const limit = parseInt(req.query.limit, 10);

  return User.getLeaderboard(offset, limit)
    .then((users) => {
      res.json({
        error: null,
        leaderboard: users.map((u) => u.getBaseProfile()),
      });
      return null;
    })
    .catch(next);
});

/**
 * Filtered leaderboard for officers and admins.
 * Returns user profiles sorted by points, filtered by the caller's
 * permissions (see buildAdminLeaderboardQuery).
 *
 * Query params: ?year, ?role, ?committee
 */
router.route('/admin').get(isOfficerOrAdmin, (req, res, next) => {
  const where = buildAdminLeaderboardQuery(req.query, req.user);

  return User.findAll({
    where,
    order: [['points', 'DESC']],
  })
    .then((users) => {
      res.json({
        error: null,
        leaderboard: users.map((u) => u.getBaseProfile()),
      });
    })
    .catch(next);
});

router.route('/:committee').get((req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  const offset = parseInt(req.query.offset, 10);
  const limit = parseInt(req.query.limit, 10);

  return Attendance.getCommitteeLeaderboard(req.params.committee, offset, limit)
    .then((results) => {
      res.json({
        error: null,
        leaderboard: results
          .filter((r) => r.user !== null)
          .map((r) => ({
            ...r.user.getBaseProfile(),
            eventsAttended: r.eventsAttended,
          })),
      });
      return null;
    })
    .catch(next);
});

module.exports = { router };
