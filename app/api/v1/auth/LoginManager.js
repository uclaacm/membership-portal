const jwt = require('jsonwebtoken');
const config = require('../../../config');
const error = require('../../../error');
const { User, Activity } = require('../../../db');


const TOKEN_EXPIRES = 86400; // 1 day in seconds


/**
 * Helper function to decompose a user into a simple struct
 * @param {User} user
 * @returns A struct of important user attributes
 */
const decomposeUser = user => ({
  uuid: user.getDataValue('uuid'),
  admin: user.isAdmin(),
  superAdmin: user.isSuperAdmin(),
  registered: !user.isPending(),
});


/**
 * Helper function to generate a JWT for a User.
 * Creates a token with the user's ID and privilege level.
 * @param {User} user
 * @returns {Promise<string>} A JWT token
 */
const createUserToken = async user => new Promise((res, rej) => {
  jwt.sign(
    decomposeUser(user),
    config.session.secret,
    { expiresIn: TOKEN_EXPIRES },
    (err, token) => {
      if (err) rej(err);
      res(token);
    },
  );
});


/**
 *
 * @param {*} userData
 * @returns
 */
// TODO: implement email auth instead of just active
const createNewUser = async userData => User.create(userData)
  .then((user) => {
    if (user && user.isBlocked()) { throw new error.Forbidden('Your account has been blocked'); } // not needed?
    Activity.accountCreated(user.uuid);
    // register the account creation as the user's first activity
    return user; // responds with the newly created user
  });


class GoogleLogin {
  constructor(ticket) {
    const payload = ticket.getPayload();
    const givenName = payload.given_name;
    const familyName = payload.family_name;
    const {
      email, picture, googleId,
    } = payload;
    this.ticket = ticket;
    if (!email.toLowerCase().endsWith(config.google.hostedDomain)) { throw new error.Unauthorized('Unauthorized email'); }

    this.email = email;
    this.userData = {
      profileId: googleId,
      email: email.toLowerCase(),
      firstName: givenName,
      lastName: familyName,
      picture,
      state: 'PENDING',
      // PLACEHOLDERS - need to add placeholders or
      // make them nullable and then require they be added later...
      // or have a flow that requires a user to
      // fill these in right after signing in the first time
      year: 1,
      major: 'Undeclared',
    };

    this.user = undefined;
    this.jwt = undefined;
  }

  async login() {
    this.user = await User.findByEmail(this.email.toLowerCase());
    if (!this.user) { this.user = await createNewUser(this.userData); } else if (this.user.isBlocked()) { throw new error.Forbidden('Your account has been blocked'); }

    this.jwt = await createUserToken(this.user);
    await Activity.accountLoggedIn(this.user.uuid);
  }

  loginIsValid() {
    return this.user !== undefined && this.jwt !== undefined;
  }
}

module.exports = { createUserToken, createNewUser, GoogleLogin };
