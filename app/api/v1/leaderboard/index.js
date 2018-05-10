const express = require('express');
const error = require('../../../error');
const { User, Activity } = require('../../../db');
const router = express.Router();

/**
 * Get the leaderboard.
 *
 * It returns an ordered list of public user profiles by descending number of points.
 * It also supports pagination using 'offset' and 'limit' query parameters
 */
 router.route('/')
 .get((req, res, next) => {
 	const offset = parseInt(req.query.offset);
 	const limit = parseInt(req.query.limit);

 	User.getLeaderboard(offset, limit).then(users => {
 		// map the user objects to public (just name, picture, and points) for privacy reasons

    const leaderboard = users.map(u => u.getUserProfile());
    leaderboard.forEach((user, i) => {
      Activity.getPublicStream(user.uuid).then(activity => {
			  leaderboard[i].activity = activity.map(a => a.getPublic());
			})
    })

		res.json({ error: null, leaderboard: leaderboard});
 	}).catch(next);
 });

module.exports = { router };
