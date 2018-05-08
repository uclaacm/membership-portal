const Sequelize = require('sequelize');
const _ = require('underscore')
const error = require('../../../error');
const express = require('express')
const { Activity, Attendance, Event, User, db } = require('../../../db');
let router = express.Router();

// route each API version
router.route('/')
.get((req, res, next) => {
	// TODO: Remove hardcoded values
	const start = new Date(0);
	const end = new Date();
	const committee = 'Hack';

	// let timeseriesPromises = Event.getByFilters({ start, end, committee }).then(events => {
	// 	const attendances = [];
	// 	events.forEach(event => {
	// 		analytics.push({ event: event.getPublic() });
	// 		attendances.push(Attendance.getAttendanceForEvent(event.uuid))
	// 	})
	// 	return Promise.all(attendances);
	// })
	
	let eventPromises = Event.getAll()
	.then(events => getAnalyticsForEvents(events))
	.then(analytics => res.json(analytics));
});

router.route('/events')
.get((req, res, next) => {
	let analytics = [];
	let userCounts = [];
	Event.getAll()
	.then(events => {
		return Promise.all(events.map(getAnalyticsForEvent));
	})
	.then(analytics => {
		res.json({ error: null, analytics });
	})
	.catch(next);
});

function getAnalyticsForEvents(events) {
	return Promise.all(events.map(getAnalyticsForEvent));
}

function getAnalyticsForEvent(event) {
	return Attendance.getAttendanceForEvent(event.uuid)
	.then(attendance => {
		const users = attendance.map(singleAttendance => User.findByUUID(singleAttendance.user));
		let attendanceTimes = attendance.map(singleAttendance => new Date(singleAttendance.date));
		attendanceTimes = _.countBy(attendanceTimes, time => {
			time.setMilliseconds(0);
			time.setSeconds(0);
			return time;
		})

		return Promise.all(users).then(users => {
			return {
				event,
				analytics: {
					majors: _.countBy(users, user => user.major),
					years: _.countBy(users, user => user.year),
					attendance: users.map(user => user.getUserProfile()),
					timeseries: attendanceTimes
				}
			};
		});
	})
}

module.exports = { router };
