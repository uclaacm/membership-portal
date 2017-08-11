const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const error = require('../../../error');
const log = require('../../../logger');
const Mail = require('../../../mail');
const { User, Activity } = require('../../../db');
const router = express.Router();

const TOKEN_EXPIRES = 86400; // 1 day in seconds

const authenticated = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if (!authHeader)
		return next(new error.Unauthorized());

	const authHead = authHeader.split(' ');
	if(authHead.length != 2 || authHead[0] !== 'Bearer' || authHead[1].length < 1)
		return next(new error.Unauthorized());

	const token = authHead[1];
	jwt.verify(token, config.session.secret, (err, decoded) => {
		if(err)
			return next(new error.Unauthorized());

		User.findByUUID(decoded.uuid).then(user => {
			if (!user)
				throw new error.Unauthorized();
			req.user = user;
		}).then(next).catch(next);
	});
};

router.post("/login", (req, res, next) => {
	if(!req.body.email || req.body.email.length < 1)
		return next(new error.BadRequest('Email must be provided'));

	if(!req.body.password || req.body.password.length < 1)
		return next(new error.BadRequest('Password must be provided'));

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
		}).then(() => new Promise((resolve, reject) => {
			jwt.sign({
				uuid  : user.getDataValue('uuid'),
				admin : user.isAdmin()
			}, config.session.secret, { expiresIn: TOKEN_EXPIRES }, (err, token) => {
				return err ? reject(err) : resolve(token);
			});
		}));
	}).then(token => {
		res.json({ error: null, token: token });
		Activity.accountLoggedIn(user.uuid);
	}).catch(next);
});

// TODO: implement registration API
router.post("/register", (req, res, next) => {
	if (!req.body.user)
		return next(new error.BadRequest('User must be provided'));
	if (!req.body.user.password)
		return next(new error.BadRequest('Password must be provided'));
	if (req.body.user.password.length < 10)
		return next(new error.BadRequest('Password should be at least 10 characters long'));

	let userModel = User.sanitize(req.body.user);
	userModel.state = 'ACTIVE'; // TODO: implement email auth instead of just active
	User.generateHash(req.body.user.password).then(hash => {
		userModel.hash = hash;
		return User.create(userModel);
	}).then(user => {
		res.json({ error: null, user: user.getPublicProfile() });
		Activity.accountCreated(user.uuid);
	}).catch(next);
});

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

router.get('/resetPassword/:email', (req, res, next) => {
	User.findByEmail(req.params.email).then(user => {
		if (!user)
			throw new error.NotFound('Invalid user');
		if (user.isBlocked())
			throw new error.Forbidden('Your account has been blocked');
		if (user.isPending())
			throw new error.Unprocessable('You must activate your account first');

		return User.generateAccessCode().then(code => {
			user.accessCode = code;
			user.state = 'PASSWORD_RESET';
			return Mail.sendPasswordReset(user.email, user.firstName, code);	
		}).then(() => user.save());
	}).then(user => {
		res.json({ error: null });
		Activity.accountRequestedResetPassword(user.uuid);
	}).catch(next);
});

router.post('/resetPassword/:accessCode', (req, res, next) => {
	if (!req.params.accessCode)
		return next(new error.BadRequest('Invalid access code'));
	if (!req.body.user || !req.body.user.newPassword || !req.body.user.confPassword)
		return next(new error.BadRequest('Invalid user data'));
	if (req.body.user.newPassword !== req.body.user.confPassword)
			return next(new error.UserError('Passwords do not match'));
	if (req.body.user.newPassword.length < 10)
			return next(new error.UserError('New password must be at least 10 characters'));

	User.findByAccessCode(req.params.accessCode).then(user => {
		if (!user)
			throw new error.BadRequest('Invalid access code');
		return User.generateHash(req.body.user.newPassword).then(hash => {
			user.hash = hash;
			user.state = 'ACTIVE';
			user.accessCode = '';
			return user.save();
		});
	}).then(user => {
		res.json({ error: null });
		Activity.accountResetPassword(user.uuid);
	}).catch(next);
});

module.exports = { router, authenticated };
