const express = require('express');
const config = require('../../../config');
const error = require('../../../error');
const db = require('../../../db');
const router = express.Router();

router.get('/', (req, res, next) => {
	res.json({
		cpu: process.cpuUsage(),
		memory: process.memoryUsage(),
		uptime: process.uptime()
	});
});

router.get('/setup', (req, res, next) => {
	if (!config.isDevelopment)
		return next(new error.Forbidden("This route cannot be accessed in production"));
	db.setup(true).then(v => {
		res.json(v);
	});
});

module.exports = { router };