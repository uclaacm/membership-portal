const express = require('express');
const error = require('../../../../error');
const {
  Event, AuditLog, RSVP, Attendance, db: Sequelize,
} = require('../../../../db');
const { assertCanManageCommitteeResource, canManageCommitteeResource } = require('../../auth/committeeScope');
const { recordAudit } = require('../../../../audit');

const router = express.Router();

/**
 * Get all past events
 *
 * Supports pagination with 'offset' and 'limit' query parameters
 * Returns a list of event objects
 */
router.route('/past').get((req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  const offset = parseInt(req.query.offset, 10);
  const limit = parseInt(req.query.limit, 10);
  return Event.getPastEvents(offset, limit)
    .then((events) => {
      res.json({ error: null, events: events.map((e) => e.getPublic()) });
      return null;
    })
    .catch(next);
});

/**
 * Get all future events
 *
 * Supports pagination with 'offset' and 'limit' query parameters
 * Returns a list of event objects
 */
router.route('/future').get((req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  const offset = parseInt(req.query.offset, 10);
  const limit = parseInt(req.query.limit, 10);
  return Event.getFutureEvents(offset, limit)
    .then((events) => {
      res.json({ error: null, events: events.map((e) => e.getPublic()) });
      return null;
    })
    .catch(next);
});

/**
 * Get all events, all events by committe, a single event, based on whether a UUID is specified
 *
 * Supports pagination with 'offset' and 'limit' query parameters for listing all events
 */

// Route without UUID - get all events
router
  .route('/')
  .get((req, res, next) => {
    if (req.user.isPending()) return next(new error.Forbidden());

    const canViewAttendanceCode = req.user.isAdmin() || req.user.isOfficer();

    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);
    const { committee } = req.query;
    // CASE: committee is present, return all events for committee
    // CASE: no committee in query, return all events
    const getEvents = committee
      ? Event.getCommitteeEvents(committee, offset, limit)
      : Event.getAll(offset, limit);
    return getEvents
      .then(async (events) => {
        events.forEach((e) => {
          // Reformat google drive file links.
          // Only /file/d/<id>/ share links carry an extractable id. A cover that is already a
          // thumbnail URL (or any other drive link) does not match, and indexing [1] on the
          // null result used to throw and fail the whole request with a 500.
          if (e.cover && e.cover.includes('drive.google.com')) {
            const match = e.cover.match(/\/file\/d\/(.+?)\//);
            if (match) e.cover = `https://drive.google.com/thumbnail?id=${match[1]}&sz=s1000`;
          }
        });

        const serialized = events.map((e) => e.getPublic(canViewAttendanceCode));

        // Staff-only engagement counts, used by the Control Panel's Events table. Two grouped
        // COUNT queries rather than one pair per event, which was N+1 for a 27-event list.
        if (canViewAttendanceCode && serialized.length > 0) {
          const uuids = serialized.map((e) => e.uuid);
          const tally = (rows) => new Map(
            rows.map((row) => [row.get('event'), Number(row.get('count'))]),
          );
          const groupBy = (model) => model.findAll({
            attributes: ['event', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            where: { event: { [Sequelize.Op.in]: uuids } },
            group: ['event'],
          });

          const [rsvps, attendances] = await Promise.all([groupBy(RSVP), groupBy(Attendance)]);
          const rsvpCounts = tally(rsvps);
          const attendanceCounts = tally(attendances);

          serialized.forEach((e) => {
            e.rsvpCount = rsvpCounts.get(e.uuid) || 0;
            e.attendanceCount = attendanceCounts.get(e.uuid) || 0;
          });
        }

        res.json({ error: null, events: serialized });
        return null;
      })
      .catch(next);
  })
  /**
   * For all further requests on this route, the user needs to be an admin or officer
   */
  .all((req, res, next) => {
    if (!req.user.isAdmin() && !req.user.isOfficer()) return next(new error.Forbidden());
    return next();
  })
  /**
   * Adds an event, given an event object (see sanitize function for event DB schema)
   * Returns the newly created event upon success
   */
  .post((req, res, next) => {
    if (!req.body.event) return next(new error.BadRequest());

    if (!req.user.isAdmin()) {
      const committee = typeof req.body.event.committee === 'string'
        ? req.body.event.committee.trim()
        : '';

      if (!committee) {
        return next(new error.Forbidden('You do not have permission to create events outside your committee.'));
      }

      try {
        assertCanManageCommitteeResource(req.user, committee, 'event');
      } catch (err) {
        return next(err);
      }
    }

    if (
      req.body.event.startDate
      && req.body.event.endDate
      && new Date(req.body.event.startDate) > new Date(req.body.event.endDate)
    ) return next(new error.BadRequest('Start date must be before end date'));

    return Event.create(Event.sanitize(req.body.event))
      .then((event) => {
        res.json(
          { error: null, event: event.getPublic(req.user.isAdmin() || req.user.isOfficer()) },
        );
        recordAudit(AuditLog, req, {
          action: 'event.create',
          target: event.title,
          detail: `${event.committee || 'ACM'} · ${event.pointValue} pts`,
          committee: event.committee,
        });
        return null;
      })
      .catch(next);
  });

// Route with UUID - get single event by UUID
router
  .route('/:uuid')
  .get((req, res, next) => {
    if (req.user.isPending()) return next(new error.Forbidden());

    const canViewAttendanceCode = req.user.isAdmin() || req.user.isOfficer();

    // CASE: UUID is present, should return matching event
    return Event.findByUUID(req.params.uuid)
      .then((event) => {
        // return the public event object (or admin version, if user is admin) if
        // an event was found. otherwise, return null
        res.json({
          error: null,
          event: event ? event.getPublic(canViewAttendanceCode) : null,
        });
        return null;
      })
      .catch(next);
  })
  /**
   * Updates an event given an event UUID and the partial object with updates
   *
   * URI should contain the UUID and the POST body should contain an 'event' object
   * with updated fields.
   */
  .patch((req, res, next) => {
    if (!req.user.isAdmin() && !req.user.isOfficer()) return next(new error.Forbidden());

    if (!req.params.uuid || !req.params.uuid.trim() || !req.body.event) {
      return next(new error.BadRequest());
    }

    if (
      req.body.event.startDate
      && req.body.event.endDate
      && new Date(req.body.event.startDate) > new Date(req.body.event.endDate)
    ) return next(new error.BadRequest('Start date must be before end date'));

    // find the existing event by the given UUID
    return Event.findByUUID(req.params.uuid)
      .then((event) => {
        if (!event) throw new error.BadRequest('No such event found');

        if (!req.user.isAdmin() && !canManageCommitteeResource(req.user, event.committee)) {
          throw new error.Forbidden('You do not have permission to update this event.');
        }

        const updates = Event.sanitize(req.body.event);
        if (
          !req.user.isAdmin()
          && updates.committee
          && !canManageCommitteeResource(req.user, updates.committee)
        ) {
          throw new error.Forbidden('You do not have permission to move this event to another committee.');
        }

        // update the event with the new information after sanitizing the input
        return event.update(updates);
      })
      .then((event) => {
        res.json(
          { error: null, event: event.getPublic(req.user.isAdmin() || req.user.isOfficer()) },
        );
        recordAudit(AuditLog, req, {
          action: 'event.update',
          target: event.title,
          detail: `Updated ${Object.keys(Event.sanitize(req.body.event)).join(', ')}`,
          committee: event.committee,
        });
        return null;
      })
      .catch(next);
  })
  /**
   * Delete an event given a UUID
   *
   * Returns the number of events deleted (1 if successful, 0 if event not found)
     */
  .delete((req, res, next) => {
    if (!req.params.uuid) return next(new error.BadRequest());

    return Event.findByUUID(req.params.uuid)
      .then((event) => {
        if (!event) {
          res.json({ error: null, numDeleted: 0 });
          return null;
        }

        assertCanManageCommitteeResource(req.user, event.committee, 'event');
        return Event.destroyByUUID(req.params.uuid)
          .then((numDeleted) => {
            res.json({ error: null, numDeleted });
            recordAudit(AuditLog, req, {
              action: 'event.delete',
              target: event.title,
              detail: event.committee || 'ACM',
              committee: event.committee,
            });
            return null;
          });
      })
      .catch(next);
  });

module.exports = { router };
