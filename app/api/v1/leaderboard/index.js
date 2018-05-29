const express = require('express');
const error = require('../../../error');
const { User, Event, Attendance } = require('../../../db');
const router = express.Router();
const _ = require('underscore');

/**
 * Get the leaderboard.
 * 
 * It returns an ordered list of public user profiles by descending number of points.
 * It also supports pagination using 'offset' and 'limit' query parameters
 */
router.route('/')
.get((req, res, next) => {
	const offset = parseInt(req.query.offset);
	const limit = parseInt(req.query.limit);
	
	User.getLeaderboard(offset, limit).then(users => {
		res.json({ error: null, leaderboard: users.map(u => u.getUserProfile()) });
	}).catch(next);
});

/*
 * TODO: support pagination using 'offset' and 'limit' query
 */
router.route('/committee')
.get((req, res, next) => {
	const start = new Date(0);
	const end = new Date();
	const committee = 'Hack';
	const allEvents = [];
	const attendeePoints = [];

	Event.getByFilters({ start, end, committee }).then(events => {
		const attendees = [];
		events.forEach(event => {
			allEvents.push({ event: event.getPublic() });
			attendees.push(Attendance.getAttendanceForEvent(event.uuid));
		});
		return Promise.all(attendees);
	})
	.then(allAttendees => {
		let attendeeProfiles = [];
		let names = [];
		allAttendees.forEach((result, index) => {
			names = result.map(res => res.user);
			names.forEach((userName) => {
				attendeePoints.push({ user: userName, points: parseInt(allEvents[index].event.attendancePoints) });		
			});
		});

		names = _.uniq(names);
		names.forEach((userName) => {
			attendeeProfiles.push(User.findByUUID(userName));
		});
		return Promise.all(attendeeProfiles);
	}) 
	.then(attendeeProfiles => {
		attendeeProfiles.map(user => user.getUserProfile());
		attendeeProfiles.forEach((user, index) => {
			user.points = 0;
		});

		attendeePoints.forEach((userName) => {
			attendeeProfiles.find(u => u.uuid == userName.user).points += userName.points;
		});
		res.json(_.sortBy(attendeeProfiles, 'points').reverse());
	})
	.catch(next);
})

module.exports = { router };
