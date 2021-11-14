const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const error = require('../../../error');
const log = require('../../../logger');
const Mail = require('../../../mail');
const { User, Activity } = require('../../../db');

const router = express.Router();
const { OAuth2Client } = require('google-auth-library');

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
        if (!user) throw new error.Unauthorized();
        req.user = user;
      })
      .then(next)
      .catch(next);
  });
};

/**
 * Login route.
 *
 * POST body should be in the format of { email, password }
 * On success, this route will return a token
 */
router.post('/login', (req, res, next) => {
  if (!req.body.tokenId || req.body.tokenId.length < 1) return next(new error.BadRequest('Invalid token.'));

  const createUserToken = (user) => {
	// create a token with the user's ID and privilege level
	jwt.sign(
	  {
		uuid: user.getDataValue('uuid'),
		admin: user.isAdmin(),
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
		// register that the user logged in
		Activity.accountLoggedIn(user.uuid);
	  },
	);
  };

  client
    .verifyIdToken({
      idToken: req.body.tokenId,
      audience: config.google.clientId,
    })
    .then((ticket) => {
      const { email } = ticket.getPayload();

      User.findByEmail(email.toLowerCase())
        .then(user => ({ user, ticket }))
        .then((userData) => {
          const { user, ticket } = userData;
          const {
            given_name, family_name, email, picture, googleId,
          } = ticket.getPayload();

          if (!user) {
            // TODO: implement email auth instead of just active
            // get a sanitized version of the input
            const userModel = {
              profileId: googleId,
              email: email.toLowerCase(),
              firstName: given_name,
              lastName: family_name,
              picture,
              state: 'ACTIVE',
              // PLACEHOLDERS - need to add placeholders or make them nullable and then require they be added later...
              // or have a flow that requires a user to fill these in right after signing in the first time
              year: 1,
              major: 'underwater basketweaving',
            };

            User.create(userModel)
              .then((user) => {
                if (user && user.isBlocked()) throw new error.Forbidden('Your account has been blocked');
                // register the account creation as the user's first activity
                Activity.accountCreated(user.uuid);
                // responds with the newly created user
                return user;
              })
              .then(user => createUserToken(user)).catch(next);

            return null; // we don't care about result (http://goo.gl/rRqMUw)
          }
          if (user && user.isBlocked()) throw new error.Forbidden('Your account has been blocked');
          else {
            createUserToken(user);

            return null; // we don't care about result (http://goo.gl/rRqMUw)
          }
        })
        .catch(next);
    })
    .catch(next);
});
module.exports = { router, authenticated };
