const error = require('../../../../error');
const { COMMITTEES } = require('../../../../committees');

// The query param is lowercase; the canonical list is display-cased. Derived once here rather
// than inlined below, which is what previously let this list drift behind app/committees.js.
const COMMITTEE_FILTERS = COMMITTEES.map((committee) => committee.toLowerCase());

const parseFilters = (req, res, next) => {
  const filters = {};

  if (req.query.committee) {
    if (COMMITTEE_FILTERS.indexOf(req.query.committee) < 0) {
      return next(new error.BadRequest('Invalid committee'));
    }
    filters.committee = req.query.committee;
  }

  const startDateParsed = Date.parse(req.query.startDate);
  if (!Number.isNaN(startDateParsed)) {
    filters.startDate = new Date(req.query.startDate);
  } else {
    filters.startDate = new Date(0);
  }

  const endDateParsed = Date.parse(req.query.endDate);
  if (!Number.isNaN(endDateParsed)) {
    filters.endDate = new Date(req.query.endDate);
  } else {
    filters.endDate = new Date();
  }

  const offsetParsed = parseInt(req.query.offset, 10);
  if (offsetParsed >= 0) {
    filters.offset = offsetParsed;
  }

  const limitParsed = parseInt(req.query.limit, 10);
  if (limitParsed >= 0) {
    filters.limit = limitParsed;
  }

  req.filters = filters;
  return next();
};

module.exports = { parseFilters };
