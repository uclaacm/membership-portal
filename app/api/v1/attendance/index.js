const Sequelize = require('sequelize');
const express = require('express');
const error = require('../../../error');
const {
  Event, Activity, Attendance, db,
} = require('../../../db');

const router = express.Router();

/**
 * Gets the attendance for a single event or for the user
 * Returns a list of attendance objects
 */
router.route('/:uuid?').get((req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  // store successful response function
  //   map each attendance record in the db to its public version (see app/db/schema/attendance.js)
  const callback = attendance => res.json({
    error: null,
    attendance: attendance.map(a => a.getPublic()),
  });
  if (req.params.uuid) {
    // if an event UUID is provided, find all attendance records for that event
    //   essentially will return all the users that attended an event
    return Attendance.getAttendanceForEvent(req.params.uuid)
      .then(callback)
      .catch(next);
  }
  // otherwise, just get all the attendance records for the user
  //   essentially will return all the events this user attended
  return Attendance.getAttendanceForUser(req.user.uuid)
    .then(callback)
    .catch(next);
});

/**
 * Record that the user attended an event
 */
router.route('/attend').post((req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  // the user must specify the attendance code
  if (!req.body.event.attendanceCode) return next(new error.BadRequest());

  const now = new Date();
  Event.findByAttendanceCode(req.body.event.attendanceCode)
    .then((event) => {
      if (!event) throw new error.UserError("Oh no! That code didn't work.");

      if (now < event.startDate || now > event.endDate) {
        throw new error.UserError(
          'You can only enter the attendance code during the event!',
        );
      }

      // use a database transaction around the critical section
      // this makes sure that a user cannot get duplicate points by ensuring
      // the invariant "user has not attended event"
      return db.transaction({
        // disallow dirty read and varying repeated read
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
      }, () => Attendance.userAttendedEvent(req.user.uuid, event.uuid).then((attended) => {
        if (attended) {
          return Promise.reject(new error.UserError('You have already attended this event!'));
        }
        return Promise.all([
          Attendance.attendEvent(req.user.uuid, event.uuid),
          Activity.attendedEvent(
            req.user.uuid,
            event.title,
            event.attendancePoints,
          ),
          req.user.addPoints(event.attendancePoints),
        ]);
      }))
        .then(() => {
          res.json({ error: null, event: event.getPublic() });
          return null;
        });
    })
    .catch(next);
});

module.exports = { router };
