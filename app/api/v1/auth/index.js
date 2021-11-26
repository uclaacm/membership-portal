const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const error = require('../../../error');
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
 * TODO: describe what this does
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
		// record that the user logged in
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
              state: 'PENDING',
              // PLACEHOLDERS - need to add placeholders or make them nullable and then require they be added later...
              // or have a flow that requires a user to fill these in right after signing in the first time
              year: 1,
              major: 'Undeclared',
            };

            User.create(userModel)
              .then((user) => {
                if (user && user.isBlocked()) throw new error.Forbidden('Your account has been blocked'); // not needed?
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

/**
 * Registration route.
 * 
 * TODO: describe what this does
 * 
 */
 router.post("/register", (req, res, next) => {
  if (!req.body.user)
  return next(new error.BadRequest());

  if (req.user.isPending())
  return next(new error.Forbidden());

  if (!req.body.info)
		return next(new error.BadRequest('Year and major must be provided'));

	// construct new, sanitized object of update information
	const updatedInfo = {};

  if (req.body.user.major && req.body.user.major.length > 0 && req.body.user.major !== req.user.major)
    updatedInfo.major = req.body.user.major;
  
  if (req.body.user.year && parseInt(req.body.user.year) !== NaN && parseInt(req.body.user.year) > 0 && parseInt(req.body.user.year) <= 5 && req.body.user.year !== req.user.year)
    updatedInfo.year = parseInt(req.body.user.year);
  
  updatedInfo.state = "ACTIVE";

  req.user.update(updatedInfo).then(user => {
		// respond with the newly updated user profile
		res.json({ error: null, user: user.getUserProfile() });
		// record that the user changed some account information, and what info was changed
		Activity.accountUpdatedInfo(user.uuid, Object.keys(updatedInfo).join(", "));
	}).catch(next);
});

module.exports = { router, authenticated };
