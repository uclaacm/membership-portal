const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const error = require('../../../error');
const { User, Activity } = require('../../../db');

const router = express.Router();

const client = new OAuth2Client(config.google.clientId);

const TOKEN_EXPIRES = 86400; // 1 day in seconds

/**
 * Middleware function that determines whether or not a user is authenticated
 * and assigns the req.user object to their user info from the db
 *
 * @param req The request object
 * @param res The response object
 * @param next The next-middleware function
 */
const authenticated = (req, res, next) => {
  // We're looking for a header in the form of:
  //   Authorization: Bearer <TOKEN>
  const authHeader = req.get('Authorization');
  if (!authHeader) return next(new error.Unauthorized());

  // authHead should be in the form of ['Bearer', '<TOKEN>']
  const authHead = authHeader.split(' ');
  if (
    authHead.length !== 2
    || authHead[0] !== 'Bearer'
    || authHead[1].length < 1
  ) return next(new error.Unauthorized());

  const token = authHead[1];
  jwt.verify(token, config.session.secret, (err, decoded) => {
    if (err) return next(new error.Unauthorized());

    // if the user provided a valid token, use it to deserialize the UUID to
    // an actual user object
    User.findByUUID(decoded.uuid)
      .then((user) => {
        if (!user) return next(new error.Unauthorized());
        req.user = user;
        return next();
      })
      .catch(next);
    return null;
  });
  return null;
};

/**
 * Login route.
 *
 * Expects a Google ID token
 *
 * On success, this route will return the user's public profile and a user token containing user's
 * ID and privilege levels
 */
router.post('/login', (req, res, next) => {
  if (!req.body.tokenId || req.body.tokenId.length < 1) return next(new error.BadRequest('Invalid token.'));

  const createUserToken = (user) => {
    // create a token with the user's ID and privilege level
    jwt.sign(
      {
        uuid: user.getDataValue('uuid'),
        admin: user.isAdmin(),
        superAdmin: user.isSuperAdmin(),
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
        Activity.accountLoggedIn(user.uuid);
        return null;
      },
    );
    return null;
  };

  client
    .verifyIdToken({
      idToken: req.body.tokenId,
      audience: config.google.clientId,
    })
    .then((ticket) => {
      const { email } = ticket.getPayload();

      if (!email.toLowerCase().endsWith(config.google.hostedDomain)) {
        return next(
          new error.Unauthorized('Unauthorized email'),
        );
      }

      User.findByEmail(email.toLowerCase())
        .then((userObj) => {
          const {
            given_name: givenName,
            family_name: familyName,
            email: userEmail,
            picture,
            googleId,
          } = ticket.getPayload();

          if (!userObj) {
            // TODO: implement email auth instead of just active
            // get a sanitized version of the input
            const userModel = {
              profileId: googleId,
              email: userEmail.toLowerCase(),
              firstName: givenName,
              lastName: familyName,
              picture,
              state: 'PENDING',
              year: 1,
              major: 'Undeclared',
            };

            return User.create(userModel)
              .then((createdUser) => {
                if (createdUser && createdUser.isBlocked()) {
                  return next(new error.Forbidden('Your account has been blocked'));
                }
                Activity.accountCreated(createdUser.uuid);
                return createUserToken(createdUser);
              })
              .catch(next);
          }
          if (userObj && userObj.isBlocked()) {
            return next(new error.Forbidden('Your account has been blocked'));
          }
          return createUserToken(userObj);
        })
        .catch(next);
      return null;
    })
    .catch(next);
  return null;
});

module.exports = { router, authenticated };
