const express = require('express');
const error = require('../../../error');
const { Activity } = require('../../../db');

const router = express.Router();

/**
 * Registration route.
 * 
 * TODO: describe what this does
 * 
 */
 router.post("/", (req, res, next) => {
    if (req.user.isActive())
        return next(new error.Forbidden());
  
    if (!req.body.info)
        return next(new error.BadRequest('Year and major must be provided'));
  
      // construct new, sanitized object of update information
      const updatedInfo = {};
  
    if (req.body.info.major && req.body.info.major.length > 0 && req.body.info.major !== req.user.major)
      updatedInfo.major = req.body.info.major;
    
    if (req.body.info.year && parseInt(req.body.info.year) !== NaN && parseInt(req.body.info.year) > 0 && parseInt(req.body.info.year) <= 5 && req.body.info.year !== req.user.year)
      updatedInfo.year = parseInt(req.body.info.year);
    
    updatedInfo.state = "ACTIVE";
  
    req.user.update(updatedInfo).then(user => {
          // respond with the newly updated user profile
          res.json({ error: null, user: user.getUserProfile() });
          // record that the user changed some account information, and what info was changed
          Activity.accountUpdatedInfo(user.uuid, Object.keys(updatedInfo).join(", "));
      }).catch(next);
  });

module.exports = { router };
