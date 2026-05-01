const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../validation');

const REPEATED_EVENT_SCOPES = ['all', 'fromInstance'];
const REPEATED_EVENT_FREQUENCIES = ['daily', 'weekly', 'monthly'];

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
  body('recurrence.frequency')
    .isIn(REPEATED_EVENT_FREQUENCIES)
    .withMessage('recurrence.frequency must be one of daily, weekly, or monthly'),
  body('recurrence.seriesEndDate')
    .isISO8601()
    .withMessage('recurrence.seriesEndDate must be a valid date'),
  body()
    .custom((_value, { req }) => {
      const { evt, recurrence } = req.body;
      if (!evt || !recurrence) return true;

      if (
        evt.startDate
        && evt.endDate
        && new Date(evt.startDate) > new Date(evt.endDate)
      ) {
        throw new Error('Start date must be before end date');
      }

      if (
        evt.startDate
        && recurrence.seriesEndDate
        && new Date(recurrence.seriesEndDate) < new Date(evt.startDate)
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

const validatePatchRepeatedEvent = [
  ...validateRepeatedEventScope.slice(0, -1),
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

module.exports = {
  validateCreateEvent,
  validateCreateRepeatedEvent,
  validateRepeatedEventScope,
  validatePatchRepeatedEvent,
  REPEATED_EVENT_SCOPES,
};
