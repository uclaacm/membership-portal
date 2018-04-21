const _ = require('underscore')
const express = require('express')
const { Event, Attendance } = require('../../../db');
let router = express.Router();

// route each API version
router.route('/')
.get((req, res, next) => {
	let analytics = [];
	Event.getAll()
	.then(events => {
		let attendances = events.map(event => {
			analytics.push({
				event: event.getPublic()
			});
			return Attendance.getAttendanceForEvent(event.uuid);
		});
		return Promise.all(attendances);
	})
	.then(results => {
		results.forEach((result, index) => {
			console.log(index, result);
			analytics[index].analytics = {
				attendance: result.length
			};
		});
		res.json(analytics);
	})
	.catch(next);
});

module.exports = { router };
