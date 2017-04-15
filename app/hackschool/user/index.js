const express = require('express');
const db = require('../../db');
let router = express.Router();

router.get('/', (req, res) => {
	res.json({
		success: true,
		error: null,
		user: req.user.getPublic()
	});
});

module.exports = { router };
