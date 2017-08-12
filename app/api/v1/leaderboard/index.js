const express = require('express');
const error = require('../../../error');
const { User } = require('../../../db');
const router = express.Router();

router.route('/')
.get((req, res, next) => {
	const offset = parseInt(req.query.offset);
	const limit = parseInt(req.query.limit);
	
	User.getLeaderboard(offset, limit).then(users => {
		res.json({ error: null, leaderboard: users.map(u => u.getUserProfile()) });
	}).catch(next);
});

module.exports = { router };
