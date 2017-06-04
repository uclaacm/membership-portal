const express = require('express');
const error = require('../../../error');
const User = require('../../../db').User;
let router = express.Router();

router.route('/')
.get((req, res, next) => {
	let offset = parseInt(req.query.offset);
	let limit = parseInt(req.query.limit);

	User.getLeaderboard(offset, limit).then(users => {
		res.json({ error: null, leaderboard: users.map(u => u.getUserProfile()) });
	}).catch(next);
});

module.exports = { router };
