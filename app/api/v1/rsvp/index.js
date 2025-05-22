const express = require('express');
const error = require('../../../error');
const {
  Event, Activity, RSVP, db,
} = require('../../../db');

const router = express.Router();

/**
 * Gets all RSVPs for a single event or for the user
 * Returns a list of RSVP objects
 */
router.route('/:uuid?').get((req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  // store successful response function
  const callback = rsvps => res.json({ error: null, rsvps: rsvps.map(r => r.getPublic()) });

  if (req.params.uuid) {
    // If an event UUID is provided, find all RSVP records for THAT EVENT
    // Will return all users who RSVPed to an event
    RSVP.getRSVPsForEvent(req.params.uuid)
      .then(callback)
      .catch(next);
  } else {
    // Otherwise, get all RSVP records for the CURRENT USER
    // Will return all events this user RSVPed to
    RSVP.getRSVPsForUser(req.user.uuid)
      .then(callback)
      .catch(next);
  }
});

/**
 * Record that the user RSVPed to an event
 */
router.route('/add').post((req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  // The user must specify the event UUID
  if (!req.body.event || !req.body.event.uuid) { return next(new error.BadRequest('Event UUID is required')); }

  Event.findByUUID(req.body.event.uuid)
    .then((event) => {
      if (!event) { throw new error.UserError('Event not found'); }

      const now = new Date();
      if (now > event.startDate) throw new error.UserError('Cannot RSVP to an event that has already started');

      // Check if the user has already RSVPed to this event
      return RSVP.userRSVPedEvent(req.user.uuid, event.uuid)
        .then((rsvped) => {
          if (rsvped) throw new error.UserError('You have already RSVPed to this event');

          // Record the RSVP
          return RSVP.rsvpToEvent(req.user.uuid, event.uuid)
            .then(() => {
              res.json({
                error: null,
                success: true,
                message: 'Successfully RSVPed to event',
                event: event.getPublic(),
              });
            });
        });
    })
    .catch(next);
});

/**
 * Cancel a user's RSVP to an event
 */
router.route('/:uuid').delete((req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  // The user must specify the event UUID
  if (!req.params.uuid) { return next(new error.BadRequest('Event UUID is required')); }

  Event.findByUUID(req.params.uuid)
    .then((event) => {
      if (!event) { throw new error.UserError('Event not found'); }

      const now = new Date();
      if (now > event.startDate) throw new error.UserError('Cannot cancel RSVP to an event that has already started');

      // Check if the user has RSVPed to this event
      return RSVP.userRSVPedEvent(req.user.uuid, event.uuid)
        .then((rsvped) => {
          if (!rsvped) throw new error.UserError('You have not RSVPed to this event');

          // Cancel the RSVP
          return RSVP.cancelRSVP(req.user.uuid, event.uuid)
            .then(() => {
              res.json({
                error: null,
                success: true,
                message: 'Successfully cancelled RSVP',
                event: event.getPublic(),
              });
            });
        });
    })
    .catch(next);
});

module.exports = { router };
