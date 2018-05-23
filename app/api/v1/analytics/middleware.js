const error = require('../../../error');

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
