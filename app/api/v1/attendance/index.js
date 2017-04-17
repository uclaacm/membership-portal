const express = require('express');
let router = express.Router();

const app = require('../../../');
const User = app.db.User;
const Event = app.db.Event;
const Attendance = app.db.Attendance;

router.route('/:uuid')
.get((req, res, next) => {
    let getAttendance = req.params.uuid ? Attendance.getAttendanceForEvent : Attendnace.getAttendanceForUser;
    let uuid = req.params.uuid ? req.params.uuid : req.user.uuid;

    getAttendance(uuid).then(attendance => {
        res.json({ error: null, attendance: attendance.map(a => a.getPublic()) });
    }).catch(next);
});

router.route('/attend/:uuid')
.post((req, res, next) => {
    if (!req.params.uuid || !req.body.event.attendanceCode)
        return next(new app.error.BadRequest());

    Event.eventExists(req.params.uuid).then(exists => {
        if (!exists)
            throw new app.error.UserError("An event with that ID doesn't exist");

    }).then(Attendance.userAttendedEvent(req.user.uuid, req.params.uuid)).then(attended => {
        if (attended)
            throw new app.error.UserError("You already attended this event");

    }).then(Event.findByUUID(req.params.uuid)).then(event => {
        if (req.body.event.attendanceCode.toLowerCase().trim() !== event.attendanceCode.toLowerCase().trim())
            throw new app.error.UserError("Incorrect Attendance Code");

        return Promise.all([
            Attendance.attendEvent(req.user.uuid, req.params.uuid),
            req.user.addPoints(event.attendancePoints)
        ]);
    }).catch(next);    
});

module.exports = { router };