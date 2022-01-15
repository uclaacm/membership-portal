const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const error = require('../../../error');
const { Activity } = require('../../../db');

const router = express.Router();

const TOKEN_EXPIRES = 86400; // 1 day in seconds

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
  
    const createUserToken = (user) => {
        // create a token with the user's ID and privilege level
        jwt.sign(
            {
                uuid: user.getDataValue('uuid'),
                admin: user.isAdmin(),
                registered: !user.isPending(),
            },
            config.session.secret,
            { expiresIn: TOKEN_EXPIRES },
            (err, token) => {
            if (err) return next(err);
          
            // respond with the token upon successful login
            res.json({
              error: null,
              user: user.getPublicProfile(),
              token,
            });
          // record that the user changed some account information, and what info was changed
          Activity.accountActivated(user.uuid, "Registered - added year and major");
          Activity.accountUpdatedInfo(user.uuid, Object.keys(updatedInfo).join(", "));
            },
          );
        };

      // construct new, sanitized object of update information
      const updatedInfo = {};
  
    if (req.body.info.major && req.body.info.major.length > 0 && req.body.info.major !== req.user.major)
      updatedInfo.major = req.body.info.major;
    
    if (req.body.info.year && parseInt(req.body.info.year) !== NaN && parseInt(req.body.info.year) > 0 && parseInt(req.body.info.year) <= 5 && req.body.info.year !== req.user.year)
      updatedInfo.year = parseInt(req.body.info.year);
    
    updatedInfo.state = "ACTIVE";
  
    req.user.update(updatedInfo).then(user => createUserToken(user)).catch(next);
  });

module.exports = { router };
