const express = require('express');
const error = require('../../../error');
const { Event } = require('../../../db');

const router = express.Router();

/**
 * Get all past events
 *
 * Supports pagination with 'offset' and 'limit' query parameters
 * Returns a list of event objects
 */
router.route('/past')
  .get((req, res, next) => {
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);
    Event.getPastEvents(offset, limit).then((events) => {
      res.json({ error: null, events: events.map(e => e.getPublic()) });
    }).catch(next);
  });

/**
 * Get all future events
 *
 * Supports pagination with 'offset' and 'limit' query parameters
 * Returns a list of event objects
 */
router.route('/future')
  .get((req, res, next) => {
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);
    Event.getFutureEvents(offset, limit).then((events) => {
      res.json({ error: null, events: events.map(e => e.getPublic()) });
    }).catch(next);
  });

/**
 * Get all events, all events by committe, a single event, based on whether a UUID is specified
 *
 * Supports pagination with 'offset' and 'limit' query parameters for listing all events
 */
router.route('/:uuid?')
  .get((req, res, next) => {
    // CASE: no UUID is present, should return all elements
    if (!req.params.uuid || !req.params.uuid.trim()) {
      const offset = parseInt(req.query.offset, 10);
      const limit = parseInt(req.query.limit, 10);
      const { committee } = req.query;
      // CASE: committee is present, return all events by committe
      if (committee) {
        Event.getCommitteeEvents(committee, offset, limit).then((events) => {
          res.json({ error: null, events: events.map(e => e.getPublic(req.user.isAdmin())) });
        }).catch(next);
      } else {
        Event.getAll(offset, limit).then((events) => {
          // return a list of public event objects (or admin versions, if user is admin)
          res.json({ error: null, events: events.map(e => e.getPublic(req.user.isAdmin())) });
        }).catch(next);
      }
      // CASE: UUID is present, should return matching event
    } else {
      Event.findByUUID(req.params.uuid).then((event) => {
        // return the public event object (or admin version, if user is admin) if
        // an event was found. otherwise, return null
        res.json({ error: null, event: event ? event.getPublic(req.user.isAdmin()) : null });
      }).catch(next);
    }
  })
/**
 * For all further requests on this route, the user needs to be an admin
 */
  .all((req, res, next) => {
    if (!req.user.isAdmin()) return next(new error.Forbidden());
    return next();
  })
/**
 * Adds an event, given an event object (see sanitize function for event DB schema)
 * Returns the newly created event upon success
 */
  .post((req, res, next) => {
    if (req.params.uuid || !req.body.event) return next(new error.BadRequest());

    if (req.body.event.startDate && req.body.event.endDate && new Date(req.body.event.startDate) > new Date(req.body.event.endDate)) return next(new error.BadRequest('Start date must be before end date'));

    Event.create(Event.sanitize(req.body.event)).then((event) => {
      res.json({ error: null, event: event.getPublic() });
    }).catch(next);
  })
/**
 * Updates an event given an event UUID and the partial object with updates
 *
 * URI should contain the UUID and the POST body should contain an 'event' object
 * with updated fields.
 */
  .patch((req, res, next) => {
    if (!req.params.uuid || !req.params.uuid.trim() || !req.body.event) {
      return next(new error.BadRequest());
    }

    if (req.body.event.startDate && req.body.event.endDate && new Date(req.body.event.startDate) > new Date(req.body.event.endDate)) return next(new error.BadRequest('Start date must be before end date'));

    // find the existing event by the given UUID
    Event.findByUUID(req.params.uuid).then((event) => {
      if (!event) throw new error.BadRequest('No such event found');
      // update the event with the new information after sanitizing the input
      return event.update(Event.sanitize(req.body.event));
    }).then((event) => {
      res.json({ error: null, event: event.getPublic() });
    }).catch(next);
  })
/**
 * Delete an event given a UUID
 *
 * Returns the number of events deleted (1 if successful, 0 if event not found)
 */
  .delete((req, res, next) => {
    if (!req.params.uuid) return next(new error.BadRequest());
    Event.destroyByUUID(req.params.uuid).then((numDeleted) => {
      res.json({ error: null, numDeleted });
    }).catch(next);
  });

module.exports = { router };
