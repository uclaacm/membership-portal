const express = require('express');
const error = require('../../../../error');
const { Event, db } = require('../../../../db');
const {
  assertCanManageCommitteeResource,
  canManageCommitteeResource,
} = require('../../auth/committeeScope');
const {
  validateCreateRepeatedEvent,
  validateRepeatedEventScope,
  validatePatchRepeatedEvent,
} = require('./validation');
const { buildRepeatedEventRows } = require('./repeatedService');

const router = express.Router();

const canViewAttendanceCode = (user) => user.isAdmin() || user.isOfficer();

const ensureCanManageEvents = (user, events) => {
  if (user.isAdmin()) return;
  events.forEach((event) => {
    if (!canManageCommitteeResource(user, event.committee)) {
      throw new error.Forbidden('You do not have permission to manage one or more events in this group.');
    }
  });
};

const findScopedEvents = async ({
  eventGroupId,
  scope = 'all',
  fromUuid,
  transaction,
}) => {
  const allEvents = await Event.findAllByEventGroupId(eventGroupId, transaction);
  if (allEvents.length === 0) {
    throw new error.BadRequest('No repeated event group found');
  }

  if (scope !== 'fromInstance') return allEvents;

  const anchorEvent = allEvents.find((event) => event.uuid === fromUuid);
  if (!anchorEvent) {
    throw new error.BadRequest('fromUuid does not belong to this event group');
  }

  return allEvents.filter((event) => new Date(event.startDate) >= new Date(anchorEvent.startDate));
};

router.route('/repeated')
  .post(...validateCreateRepeatedEvent, async (req, res, next) => {
    try {
      if (!req.user.isAdmin() && !req.user.isOfficer()) throw new error.Forbidden();

      const eventData = Event.sanitize(req.body.event);
      const committee = typeof eventData.committee === 'string' ? eventData.committee.trim() : '';

      if (!req.user.isAdmin()) {
        if (!committee) {
          throw new error.Forbidden('You do not have permission to create events outside your committee.');
        }
        assertCanManageCommitteeResource(req.user, committee, 'event');
      }

      const { eventGroupId, rows } = buildRepeatedEventRows(eventData, req.body.recurrence);
      if (rows.length === 0) {
        throw new error.BadRequest('No repeated events fit within the requested date range.');
      }
      const created = await db.transaction((transaction) => Event.bulkCreate(
        rows,
        {
          transaction,
        },
      ));

      res.json({
        error: null,
        eventGroupId,
        events: created.map((event) => event.getPublic(canViewAttendanceCode(req.user))),
      });
    } catch (err) {
      next(err);
    }
  });

router.route('/repeated/:eventGroupId')
  .get(...validateRepeatedEventScope, async (req, res, next) => {
    try {
      if (req.user.isPending()) throw new error.Forbidden();

      const events = await Event.findAllByEventGroupId(req.params.eventGroupId);
      res.json({
        error: null,
        events: events.map((event) => event.getPublic(canViewAttendanceCode(req.user))),
      });
    } catch (err) {
      next(err);
    }
  })
  .patch(...validatePatchRepeatedEvent, async (req, res, next) => {
    try {
      if (!req.user.isAdmin() && !req.user.isOfficer()) throw new error.Forbidden();

      const scope = req.body.scope || 'all';
      const updates = Event.sanitize(req.body.event);
      const targetEvents = await findScopedEvents({
        eventGroupId: req.params.eventGroupId,
        scope,
        fromUuid: req.body.fromUuid,
      });

      ensureCanManageEvents(req.user, targetEvents);
      if (
        !req.user.isAdmin()
        && updates.committee
        && !targetEvents.every((event) => canManageCommitteeResource(
          req.user,
          updates.committee || event.committee,
        ))
      ) {
        throw new error.Forbidden('You do not have permission to move these events to another committee.');
      }

      const updated = await db.transaction(async (transaction) => Promise.all(
        targetEvents.map((event) => event.update(updates, { transaction })),
      ));

      res.json({
        error: null,
        events: updated.map((event) => event.getPublic(canViewAttendanceCode(req.user))),
      });
    } catch (err) {
      next(err);
    }
  })
  .delete(...validateRepeatedEventScope, async (req, res, next) => {
    try {
      if (!req.user.isAdmin() && !req.user.isOfficer()) throw new error.Forbidden();

      const scope = req.body.scope || 'all';
      const targetEvents = await findScopedEvents({
        eventGroupId: req.params.eventGroupId,
        scope,
        fromUuid: req.body.fromUuid,
      });

      ensureCanManageEvents(req.user, targetEvents);
      const deletedUUIDs = targetEvents.map((event) => event.uuid);
      const numDeleted = await db.transaction(
        (transaction) => Event.destroy({ where: { uuid: deletedUUIDs }, transaction }),
      );

      res.json({ error: null, numDeleted });
    } catch (err) {
      next(err);
    }
  });

module.exports = { router };
