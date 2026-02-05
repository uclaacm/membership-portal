const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../../config');
const error = require('../../../../error');
const { Activity } = require('../../../../db');

const router = express.Router();

const TOKEN_EXPIRES = 86400; // 1 day in seconds

/**
 * Registration route.
 *
 * Add year and major to complete sign up process
 *
 */
router.post('/', (req, res, next) => {
  if (req.user.isActive()) return next(new error.Forbidden());

  if (!req.body.info) return next(new error.BadRequest('Year and major must be provided'));

  // construct new, sanitized object of update information
  const updatedInfo = {};

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
        Activity.accountActivated(
          user.uuid,
          'Registered - added year and major',
        );
        Activity.accountUpdatedInfo(
          user.uuid,
          Object.keys(updatedInfo).join(', '),
        );
        return null;
      },
    );
    return null;
  };

  if (
    req.body.info.major
    && req.body.info.major.length > 0
    && req.body.info.major !== req.user.major
  ) updatedInfo.major = req.body.info.major;

  const yearInt = parseInt(req.body.info.year, 10);
  if (
    req.body.info.year
    && !Number.isNaN(yearInt)
    && yearInt > 0
    && yearInt <= 5
    && req.body.info.year !== req.user.year
  ) updatedInfo.year = yearInt;

  updatedInfo.state = 'ACTIVE';

  return req.user
    .update(updatedInfo)
    .then((user) => createUserToken(user))
    .catch(next);
});

module.exports = { router };
