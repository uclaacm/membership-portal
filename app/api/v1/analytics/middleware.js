const error = require('../../../error');

/**
* parse URL parameters
* committee
*   valid value: hack, ai, icpc, netsec, studio, w
*   default value: undefined
* startDate
*   valid value: UTC (Coordinated Universal Time) format time
*   default value: 1970-01-01T00:00:00.000Z
* endDate
*   valid value: UTC (Coordinated Universal Time) format time
*   default value: current date
* offset
*   valid value: nonnegative integer value
*   default value: undefined
* limit
*   valid value: nonnegative integer value
*   default value: undefined
*
* parsed result in req.filters
**/

const parseFilters = (req, res, next) => {
  const filters = {};

  if(req.query.committee){
    if(["hack","ai","icpc","netsec","studio","w"].indexOf(req.query.committee) < 0){
      return next(new error.BadRequest("Invalid committee"));
    }else{
      filters.committee = req.query.committee;
    }
  }

  if(!isNaN(Date.parse(req.query.startDate))){
    filters.startDate = new Date(req.query.startDate);
  }else{
    filters.startDate = new Date(0);
  }

  if(!isNaN(Date.parse(req.query.endDate))){
    filters.endDate = new Date(req.query.endDate);
  }else{
    filters.endDate = new Date();
  }

  if(parseInt(req.query.offset) >= 0){
    filters.offset = parseInt(req.query.offset);
  }

  if(parseInt(req.query.limit) >= 0){
    filters.limit = parseInt(req.query.limit);
  }

  req.filters = filters;
  return next();
}

module.exports = { parseFilters };
