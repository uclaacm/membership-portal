const express = require('express');
const { Attendance, User } = require('../../../db');

const router = express.Router();

/**
 * Get the leaderboard.
 *
 * It returns an ordered list of public user profiles by descending number of points.
 * It also supports pagination using 'offset' and 'limit' query parameters
 */
router.route('/')
  .get((req, res, next) => {
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);

    User.getLeaderboard(offset, limit).then((users) => {
      // map the user objects to public (just name, picture, and points) for privacy reasons
      res.json({ error: null, leaderboard: users.map(u => u.getUserProfile()) });
    }).catch(next);
  });

router.route('/:committee')
  .get((req, res, next) => {
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);
    const { committee } = req.query;

    Attendance.getCommitteeLeaderboard(committee, offset, limit).then((attendances) => {
      // map the user objects to public (just name, picture, and points) for privacy reasons
      res.json({ error: null, committee_leaderboard: attendances.map(a => a.getPublic()) });
    }).catch(next);
  });

module.exports = { router };
