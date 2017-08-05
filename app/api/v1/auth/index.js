const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const error = require('../../../error');
const log = require('../../../logger');
let User = require('../../../db').User;
let router = express.Router();

const dayseconds = 86400;
const dayweek = dayseconds * 6;

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
				uuid     : user.getDataValue('uuid'),
				admin    : user.isAdmin()
			}, config.session.secret, {expiresIn: dayseconds}, (err, token) => {
				return err ? reject(err) : resolve(token);
			});
		}));
	}).then(token => {
		res.json({ error: null, token: token });
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
	}).catch(next);
});

router.get('/activate/:accessCode', (req, res, next) => {
	if (!req.params.accessCode)
		return next(new error.BadRequest('Invalid access code'));
	User.findByAccessCode(req.params.accessCode).then(user => {
		if (!user)
			throw new error.BadRequest('Invalid access code or no such user');
		if (!user.isPending())
			throw new error.BadRequest('Your account does not need to be activated');
		return user.update({ state: 'ACTIVE' });
	}).then(user => {
		res.json({ error: null });
	}).catch(next);
});

module.exports = { router, authenticated };
