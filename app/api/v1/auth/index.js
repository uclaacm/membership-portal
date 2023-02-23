const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const error = require("../../../error");
const { User, Activity } = require("../../../db");

const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const { times } = require("underscore");

const client = new OAuth2Client(config.google.clientId);

const TOKEN_EXPIRES = 86400; // 1 day in seconds

/**
 * Helper function to decompose a user into a simple struct
 * @param {User} user 
 * @returns A struct of important user attributes
 */
const decomposeUser = (user) => {
  return {
    uuid: user.getDataValue("uuid"),
    admin: user.isAdmin(),
    superAdmin: user.isSuperAdmin(),
    registered: !user.isPending(),
  };
}

/**
 * Helper function to generate a JWT for a User
 * @param {User} user
 * @param {(err, token) => void} callback
 */
const createUserToken = async (user) => {
  return await new Promise((res, rej) => 
    // create a token with the user's ID and privilege level
    jwt.sign(
      decomposeUser(user),
      config.session.secret,
      { expiresIn: TOKEN_EXPIRES },
      (err, token) => {
        if (err)
          rej(err)
        res(token)
      }
    )
  );
};

/**
 * 
 * @param {*} ticket 
 * @returns 
 */
const loginFromTicket = async (ticket) => {
  const { given_name, family_name, email, picture, googleId } = ticket.getPayload();
  const userData = {
    profileId: googleId,
    email: email.toLowerCase(),
    firstName: given_name,
    lastName: family_name,
    picture,
    state: "PENDING",
    // PLACEHOLDERS - need to add placeholders or make them nullable and then require they be added later...
    // or have a flow that requires a user to fill these in right after signing in the first time
    year: 1,
    major: "Undeclared",
  }

  if (!email.toLowerCase().endsWith(config.google.hostedDomain))
    throw new error.Unauthorized("Unauthorized email");

  const user = await User.findByEmail(email.toLowerCase());
  return await handleUserLogin(user, userData);
}

/**
 * 
 * @param {*} user 
 * @returns 
 */
const loginUser = async (user) => {
  return await createUserToken(user)
  .then((token) => {
    // record that the user logged in
    Activity.accountLoggedIn(user.uuid);

    // respond with the token upon successful login
    return {
      error: null,
      user: user.getPublicProfile(),
      token,
    };
  }).catch((err) => {throw err});
}

/**
 * 
 * @param {*} user 
 * @param {*} userData 
 * @returns 
 */
const handleUserLogin = async (user, userData) => {
  if (!user)
    return await createNewUser(userData).then(loginUser);
  if (user && user.isBlocked())
    throw new error.Forbidden("Your account has been blocked");
  else{
    return await loginUser(user);
  }
}


/**
 * 
 * @param {*} userData 
 * @param {(user) => void} callback 
 * @returns 
 */
const createNewUser = async (userData) => {
  // TODO: implement email auth instead of just active

  return await User.create(userData)
    .then((user) => {
      if (user && user.isBlocked())
        throw new error.Forbidden("Your account has been blocked"); // not needed?
      // register the account creation as the user's first activity
      Activity.accountCreated(user.uuid);
      // responds with the newly created user
      return user;
    });
}


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
  const authHeader = req.get("Authorization");
  if (!authHeader) return next(new error.Unauthorized());

  // authHead should be in the form of ['Bearer', '<TOKEN>']
  const authHead = authHeader.split(" ");
  if (
    authHead.length !== 2 ||
    authHead[0] !== "Bearer" ||
    authHead[1].length < 1
  )
    return next(new error.Unauthorized());

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
  });
};

/**
 * Login route.
 *
 * Expects a Google ID token
 *
 * On success, this route will return the user's public profile and a user token containing user's ID and privilege levels
 */
router.post("/login", (req, res, next) => {
  if (!req.body.tokenId || req.body.tokenId.length < 1)
    return next(new error.BadRequest("Invalid token."));

  client.verifyIdToken({
    idToken: req.body.tokenId,
    audience: config.google.clientId,
  })
    .then((ticket) => {
      loginFromTicket(ticket)
        .then((result) => res.json(result))
        .catch(next)
    })
    .catch(next);
  return null; // we don't care about result (http://goo.gl/rRqMUw)
});

module.exports = { createUserToken, loginFromTicket, createNewUser, router, authenticated };
