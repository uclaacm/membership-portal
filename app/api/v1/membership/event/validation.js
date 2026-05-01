const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../validation');

const REPEATED_EVENT_SCOPES = ['all', 'fromInstance'];
const ISO_WEEKDAY_MIN = 1;
const ISO_WEEKDAY_MAX = 7;

const toDateOnlyKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const validateEventObject = body('event')
  .exists()
  .withMessage('Bad Request')
  .bail()
  .custom((value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Bad Request');
    }
    return true;
  });

const validateCreateEvent = [
  validateEventObject,
  body()
    .custom((_value, { req }) => {
      const evt = req.body.event;
      if (!evt) return true;
      if (
        evt.startDate
        && evt.endDate
        && new Date(evt.startDate) > new Date(evt.endDate)
      ) {
        throw new Error('Start date must be before end date');
      }
      return true;
    }),
  handleValidationErrors,
];

const validateCreateRepeatedEvent = [
  validateEventObject,
  body('recurrence')
    .isObject()
    .withMessage('recurrence is required'),
  body('recurrence.intervalWeeks')
    .isInt({ min: 1 })
    .withMessage('recurrence.intervalWeeks must be an integer greater than or equal to 1'),
  body('recurrence.daysOfWeek')
    .optional()
    .isArray({ min: 1, max: 7 })
    .withMessage('recurrence.daysOfWeek must be an array of ISO weekdays (1-7)'),
  body('recurrence.daysOfWeek.*')
    .optional()
    .isInt({ min: ISO_WEEKDAY_MIN, max: ISO_WEEKDAY_MAX })
    .withMessage('recurrence.daysOfWeek values must be integers in the range 1-7'),
  body('recurrence.daysOfWeek')
    .optional()
    .custom((daysOfWeek = []) => new Set(daysOfWeek).size === daysOfWeek.length)
    .withMessage('recurrence.daysOfWeek values must be unique'),
  body('recurrence.seriesEndDate')
    .isISO8601()
    .withMessage('recurrence.seriesEndDate must be a valid date'),
  body()
    .custom((_value, { req }) => {
      const { event: eventPayload, recurrence } = req.body;
      if (!eventPayload || !recurrence) return true;

      if (
        eventPayload.startDate
        && eventPayload.endDate
        && new Date(eventPayload.startDate) > new Date(eventPayload.endDate)
      ) {
        throw new Error('Start date must be before end date');
      }

      if (
        eventPayload.startDate
        && recurrence.seriesEndDate
        && toDateOnlyKey(recurrence.seriesEndDate) < toDateOnlyKey(eventPayload.startDate)
      ) {
        throw new Error('recurrence.seriesEndDate must be on or after event.startDate');
      }

      return true;
    }),
  handleValidationErrors,
];

const validateRepeatedEventScope = [
  param('eventGroupId')
    .isUUID()
    .withMessage('eventGroupId must be a UUID'),
  body('scope')
    .optional()
    .isIn(REPEATED_EVENT_SCOPES)
    .withMessage('scope must be all or fromInstance'),
  body('fromUuid')
    .if(body('scope').equals('fromInstance'))
    .isUUID()
    .withMessage('fromUuid must be provided for fromInstance scope'),
  handleValidationErrors,
];

const FORBIDDEN_PATCH_REPEATED_EVENT_KEYS = ['startDate', 'endDate', 'attendanceCode'];

const validatePatchRepeatedEvent = [
  ...validateRepeatedEventScope.slice(0, -1),
  validateEventObject,
  body()
    .custom((_value, { req }) => {
      const evt = req.body.event;
      if (!evt) return true;
      const forbiddenPresent = FORBIDDEN_PATCH_REPEATED_EVENT_KEYS.filter(
        (key) => Object.prototype.hasOwnProperty.call(evt, key),
      );
      if (forbiddenPresent.length > 0) {
        throw new Error(
          'Repeated group PATCH cannot change startDate, endDate, or attendanceCode. Update a single instance with PATCH /event/:uuid.',
        );
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validateCreateEvent,
  validateCreateRepeatedEvent,
  validateRepeatedEventScope,
  validatePatchRepeatedEvent,
  REPEATED_EVENT_SCOPES,
};
