const Sequelize = require('sequelize');
const express = require('express');
const error = require('../../../error');
const _ = require('underscore');
const { Event, Activity, Attendance, db } = require('../../../db');
const router = express.Router();

router.route('/')
.get((req, res, next) => {
	const start = new Date(0);
	const end = new Date();
	const committee = 'Hack';
	let analytics = [];

	Event.getByFilters({ start, end, committee }).then(events => {
		const attendances = [];
		events.forEach(event => {
			analytics.push({ event: event.getPublic() });
			attendances.push(Attendance.getAttendanceForEvent(event.uuid))
		})
		return Promise.all(attendances);
	})
	// eventsAttendance is an array of arrays, where the outer array corresponds
	// to each event and the inner array corresponds to attendance records for 
	// that event
	.then(eventsAttendance => {
		eventsAttendance.forEach((result, index) => {
			let eventTimes = result.map(res => new Date(res.date));

			let aggregatedTimes = _.countBy(eventTimes, (time) => {
				time.setMilliseconds(0);
				time.setSeconds(0);
				return time;
			});

			analytics[index].attendance = aggregatedTimes;
		});
		res.json(analytics);
	})
	.catch(next);
});


module.exports = { router };