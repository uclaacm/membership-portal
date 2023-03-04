const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const error = require("../../../error");
const { User, Activity } = require("../../../db");
const { GoogleLogin } = require("./LoginManager");

const router = express.Router();
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(config.google.clientId);


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
      .catch(next);
  });
};

/**
 * Login route.
 *
 * Expects a Google ID token
 *
 * On success, this route will return the user's public profile and a user token containing user's ID and privilege levels
 */
router.post("/login", async (req, res, next) => {
  if (!req.body.tokenId || req.body.tokenId.length < 1)
    return next(new error.BadRequest("Invalid token."));
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.tokenId,
      audience: config.google.clientId,
    });
    
    const login = new GoogleLogin(ticket);
    await login.login();
    
    if (!login.loginIsValid())
      throw new error.InternalServerError("Invalid login");
    
    res.json({
      error: null,
      user: login.user.getPublicProfile(),
      token: login.jwt,
    });
  } catch (error) {
    next(error);
  }

  return null; // we don't care about result (http://goo.gl/rRqMUw)
});

module.exports = { router, authenticated };
