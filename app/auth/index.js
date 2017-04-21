const express = require('express');
const jwt = require('jsonwebtoken');

const config = require('../config');
const error = require('../error');
const log = require('../logger');
let User = require('../db').User;
let router = express.Router();


const dayseconds = 86400;
const dayweek = dayseconds * 6;


// middleware to determine whether a user is authenticated
const authenticated = (adminMode=false)=>{
	return (req, res, next) => {
		const authHeader = req.get('Authorization');
		if(!authHeader){
			return next(new error.Unauthorized());
		}
		const authHead = authHeader.split(' ');
		if(authHead.length != 2 || authHead[0] !== 'Bearer' || authHead[1].length < 1){
			return next(new error.Unauthorized());
		}

		const token = authHead[1];
		jwt.verify(token, config.session.secret, (err, decoded)=>{
			if(err){
				return next(new error.Unauthorized());
			}
			const payload = decoded.payload;
			if(adminMode && !payload.admin){
				return next(new error.Unauthorized());
			}

			// TODO: pass on user info
			return next();
		});
	};
};

// TODO: implement login
router.post("/login", (req, res, next) => {
	if(!req.body.email || req.body.email.length < 1)
		return next(new error.BadRequest('Email must be provided'));

	if(!req.body.password || req.body.password.length < 1)
		return next(new error.BadRequest('Password must be provided'));
	
	User.findByEmail(req.body.email).then((user)=>{
		if (!user)
			throw new error.UserError('Invalid email or password');
		if (user.isPending())
			throw new error.UserError('Please activate your account. Check your email for an activation email');
		if (user.isBlocked())
			throw new error.Forbidden('Your account has been blocked');

		return user.verifyPassword(req.body.password).then(verified => {
			if (!verified)
				throw new error.UserError('Invalid email or password');
		}).then(new Promise((resolve, reject) => {
			jwt.sign({
				uuid     : user.getDataValue('uuid'),
				email    : user.getDataValue('email'),
				firstName: user.getDataValue('firstName'),
				lastName : user.getDataValue('lastName'),
				admin    : user.isAdmin()
			}, config.session.secret, {expiresIn: dayseconds}, (err, token) => {
				return err ? reject(err) : resolve(token);
			});
		}));
	}).then(token => {
		res.json({ error: null, token: token });
	}).catch(next);
});

router.post("/register", (req, res, next) => {
	return next(new error.NotImplemented());
});

router.get('/activate/:accessCode', (req, res, next) => {
	if (!req.params.accessCode)
		return next(new error.BadRequest('Invalid access code'));
	User.findByAccessCode(req.params.accessCode).then(user => {
		if (!user)
			throw new error.BadRequest('Invalid access code or no such user');
		if (!user.isPending())
			throw new error.BadRequest('This user does not need activation');
		return user.update({ state: 'ACTIVE' });
	}).then(user => {
		res.json({ error: null });
	}).catch(next);
});

module.exports = { router, authenticated };
