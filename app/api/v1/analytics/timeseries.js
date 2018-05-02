const Sequelize = require('sequelize');
const express = require('express');
const error = require('../../../error');
const { Event, Activity, Attendance, db } = require('../../../db');
const router = express.Router();

router.route('/')
.get((req, res, next) => {
	console.log("ENTERED timeseries");
	const startTime = new Date(0);
	const endTime = new Date();
	const committee = 'Hack';
	Event.getAll().then(event => {
		res.json(event);
	})
});



module.exports = { router };