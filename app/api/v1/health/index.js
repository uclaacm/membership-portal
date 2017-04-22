const express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
	res.json({
		cpu: process.cpuUsage(),
		memory: process.memoryUsage(),
		uptime: process.uptime()
	});
});

module.exports = { router };