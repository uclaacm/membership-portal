const error = require('../../../error');

const parseFilters = (req, res, next) => {
  const filters = {};

  if (req.query.committee) {
    const committees = [
      'hack',
      'ai',
      'icpc',
      'cyber',
      'studio',
      'w',
      'design',
      'teachla',
      'cloud',
    ];
    if (committees.indexOf(req.query.committee) < 0) {
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
