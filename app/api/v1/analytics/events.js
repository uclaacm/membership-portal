const _ = require('underscore')
const express = require('express')
const { Event, Attendance, User } = require('../../../db');
let router = express.Router();

// route each API version
router.route('/')
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

function getAnalyticsForEvent(event) {
	return Attendance.getAttendanceForEvent(event.uuid)
	.then(attendance => {
		users = attendance.map(singleAttendance => User.findByUUID(singleAttendance.user))
		return Promise.all(users)
	})
	.then(users => {
		return {
			event,
			analytics: {
				majors: _.countBy(users, user => user.major),
				years: _.countBy(users, user => user.year),
				attendance: users.map(user => user.getUserProfile())
			}
		};
	})
}

module.exports = { router };
