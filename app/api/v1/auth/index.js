const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const error = require('../../../error');
const log = require('../../../logger');
const Mail = require('../../../mail');
const { User, Activity } = require('../../../db');
const router = express.Router();

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
	if (!authHeader)
		return next(new error.Unauthorized());

	// authHead should be in the form of ['Bearer', '<TOKEN>']
	const authHead = authHeader.split(' ');
	if(authHead.length != 2 || authHead[0] !== 'Bearer' || authHead[1].length < 1)
		return next(new error.Unauthorized());

	const token = authHead[1];
	jwt.verify(token, config.session.secret, (err, decoded) => {
		if(err)
			return next(new error.Unauthorized());

		// if the user provided a valid token, use it to deserialize the UUID to
		// an actual user object
		User.findByUUID(decoded.uuid).then(user => {
			if (!user)
				throw new error.Unauthorized();
			req.user = user;
		}).then(next).catch(next);
	});
};

/**
 * Login route.
 * 
 * POST body should be in the format of { email, password }
 * On success, this route will return a token
 */
router.post("/login", (req, res, next) => {
	if(!req.body.email || req.body.email.length < 1)
		return next(new error.BadRequest('Email must be provided'));

	if(!req.body.password || req.body.password.length < 1)
		return next(new error.BadRequest('Password must be provided'));

	let userInfo = null;
	User.findByEmail(req.body.email.toLowerCase()).then((user)=>{
		if (!user)
			throw new error.UserError('Invalid email or password');
		if (user.isPending())
			throw new error.Unauthorized('Please activate your account. Check your email for an activation email');
		if (user.isBlocked())
			throw new error.Forbidden('Your account has been blocked');

		return user.verifyPassword(req.body.password).then(verified => {
			if (!verified)
				throw new error.UserError('Invalid email or password');
			userInfo = user;
		}).then(() => new Promise((resolve, reject) => {
			// create a token with the user's ID and privilege level
			jwt.sign({
				uuid  : user.getDataValue('uuid'),
				admin : user.isAdmin()
			}, config.session.secret, { expiresIn: TOKEN_EXPIRES }, (err, token) => err ? reject(err) : resolve(token));
		}));
	}).then(token => {
		// respond with the token upon successful login
		res.json({ error: null, token: token });
		// register that the user logged in
		Activity.accountLoggedIn(userInfo.uuid);
	}).catch(next);
});

/**
 * Registration route.
 * 
 * POST body accepts a user object (see DB schema for user, sanitize function)
 * Returns the created user on success
 */
router.post("/register", (req, res, next) => {
	if (!req.body.user)
		return next(new error.BadRequest('User must be provided'));
	if (!req.body.user.password)
		return next(new error.BadRequest('Password must be provided'));
	if (req.body.user.password.length < 10)
		return next(new error.BadRequest('Password should be at least 10 characters long'));

	// get a sanitized version of the input
	let userModel = User.sanitize(req.body.user);
	// TODO: implement email auth instead of just active
	userModel.state = 'ACTIVE'; 
	// create the password hash
	User.generateHash(req.body.user.password).then(hash => {
		userModel.hash = hash;
		// add the user to the DB
		return User.create(userModel);
	}).then(user => {
		// responsd with the newly created user
		res.json({ error: null, user: user.getPublicProfile() });
		// register the account creation as the user's first activity
		Activity.accountCreated(user.uuid);
	}).catch(next);
});

/**
 * TODO: test and use this route! It is not being used right now
 */
router.get('/activate/:accessCode', (req, res, next) => {
	if (!req.params.accessCode)
		return next(new error.BadRequest('Invalid access code'));
	User.findByAccessCode(req.params.accessCode).then(user => {
		if (!user)
			throw new error.BadRequest('Invalid access code');
		if (!user.isPending())
			throw new error.BadRequest('Your account does not need to be activated');
		return user.update({ state: 'ACTIVE' });
	}).then(user => {
		res.json({ error: null });
		Activity.accountActivated(user.uuid);
	}).catch(next);
});

/**
 * Request reset password
 * 
 * It takes a URI parameter with the email to request reset password for
 * Upon success, it sends the user an email with the reset password link
 */
router.get('/resetPassword/:email', (req, res, next) => {
	User.findByEmail(req.params.email).then(user => {
		if (!user)
			throw new error.NotFound('Invalid user');
		if (user.isBlocked())
			throw new error.Forbidden('Your account has been blocked');
		if (user.isPending())
			throw new error.Unprocessable('You must activate your account first');

		// generate an access code for the user
		return User.generateAccessCode().then(code => {
			// update the user object with the access code, update its state
			user.accessCode = code;
			user.state = 'PASSWORD_RESET';
			// send a password reset email
			return Mail.sendPasswordReset(user.email, user.firstName, code);	
		}).then(() => user.save());
	}).then(user => {
		res.json({ error: null });
		// record that the user requested a password reset
		Activity.accountRequestedResetPassword(user.uuid);
	}).catch(next);
});

/**
 * Reset the password for a user
 * 
 * Given an access code and the new password for a user, change it
 * The POST body should have a 'user' object in the form { newPassword, confPassword }
 */
router.post('/resetPassword/:accessCode', (req, res, next) => {
	if (!req.params.accessCode)
		return next(new error.BadRequest('Invalid access code'));
	if (!req.body.user || !req.body.user.newPassword || !req.body.user.confPassword)
		return next(new error.BadRequest('Invalid user data'));
	if (req.body.user.newPassword !== req.body.user.confPassword)
			return next(new error.UserError('Passwords do not match'));
	if (req.body.user.newPassword.length < 10)
			return next(new error.UserError('New password must be at least 10 characters'));

	// find the user using the given access code
	User.findByAccessCode(req.params.accessCode).then(user => {
		// if no such user was found, probably the access code is invalid or non-existent
		if (!user)
			throw new error.BadRequest('Invalid access code');
		// use the new password to update the user's hash and account state
		return User.generateHash(req.body.user.newPassword).then(hash => {
			user.hash = hash;
			user.state = 'ACTIVE';
			user.accessCode = '';
			return user.save();
		});
	}).then(user => {
		res.json({ error: null });
		// record that the user reset their password
		Activity.accountResetPassword(user.uuid);
	}).catch(next);
});

module.exports = { router, authenticated };
