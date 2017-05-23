const express = require('express');
let router = express.Router();

const error = require('../../../error');
const Event = require('../../../db').Event;
const Attendance = require('../../../db').Attendance;

router.route('/:uuid')
.get((req, res, next) => {
	let getAttendance = req.params.uuid ? Attendance.getAttendanceForEvent : Attendnace.getAttendanceForUser;
	let uuid = req.params.uuid ? req.params.uuid : req.user.uuid;

	getAttendance(uuid).then(attendance => {
		res.json({ error: null, attendance: attendance.map(a => a.getPublic()) });
	}).catch(next);
});

router.route('/attend')
.post((req, res, next) => {
	if (!req.body.event.attendanceCode)
		return next(new error.BadRequest());

	let now = new Date();
	Event.findByAttendanceCode(req.body.event.attendanceCode).then(event => {
		if (!event)
			throw new error.BadRequest("An event with that attendance code doesn't exist");
		
		if (now < event.startDate || now > event.endDate)
			throw new error.UserError("You can only enter the attendance code during the event");
		
		return Attendance.userAttendedEvent(req.user.uuid, event.uuid).then(attended => {
			if (attended)
				throw new error.UserError("You have already attended this event");

			return Promise.all([
				Attendance.attendEvent(req.user.uuid, event.uuid),
				req.user.addPoints(event.attendancePoints)
			]);
		});
	}).then(() => {
		res.json({ error: null });
	}).catch(next);    
});

module.exports = { router };