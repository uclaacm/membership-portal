const express = require('express');
const { User } = require('../../../db');

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
      res.json({ error: null, leaderboard: users.map(u => u.getPublicProfile()) });
    }).catch(next);
  });

module.exports = { router };
