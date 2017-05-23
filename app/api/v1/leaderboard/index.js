const express = require('express');
const error = require('../../../error');
const User = require('../../../db').User;
let router = express.Router();

router.route('/')
.get((req, res, next) => {
	let offset = parseInt(req.query.offset);
	let limit = parseInt(req.query.limit);
	
	User.getLeaderboard(offset, limit).then(users => {
		req.json({ error: null, scoreboard: users.map(u => u.getUserProfile()) });
	}).catch(next);
});

module.exports = { router };
