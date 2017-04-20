const express = require('express');
const config = require('../config');
const error = require('../error');
const log = require('../logger');

let passport = require('passport');
let User = require('../db').User;
let router = express.Router();


import jwt from 'jsonwebtoken';

const dayseconds = 86400;
const dayweek = dayseconds * 6;

jwtGenerate(secret, payload, expiresIn=dayseconds){
  return jwt.sign(payload, secret, {expiresIn: expiresIn});
}

jwtVerify(secret, token){
	try {
		const decoded = jwt.verify(token, secret);
		return {err: false, payload: decoded};
	} catch(err) {
		return {err: err};
	}
}

let configAuth = (server) => {
	// TODO: Implement the passport-jwt strategy here

	// Serializing users: a user is represented by their ID
	// passport.serializeUser((user, done) => {
	// 	done(null, user.id);
	// });

	// Deserializing users: lookup a user by id (how we serialized) and find the
	//   rest of the user info
	// passport.deserializeUser((id, done) => {
	// 	return User.findById(id).then(user => done(null, user)).catch(err => done(err, null));
	// });

	// Let the express server use the passport.
	// server.use(passport.initialize());

	// No need for sessions if we're using JWT
	//server.use(passport.session());
};

// middleware to determine whether a user is authenticated
let authenticated = (req, res, next) => {
	if (req.user)
		return next();
	return next(new error.Unauthorized());
};


// TODO: implement login

router.post("/login", (req, res, next) => {
	if(!req.body.email || req.body.email.length < 1){
		return next(new error.BadRequest('email must be provided'));
	}
	if(!req.body.password || req.body.password.length < 1){
		return next(new error.BadRequest('password must be provided'));
	}
	User.findByEmail(req.body.email).then((user)=>{
		// TODO:
		// - add hash
		// - update secret
		// - add admin to payload
		if(/*bcrypt hash == user.getDataValue('hash')*/ true){
			res.json({
				token: jwtGenerate('secret', {
					uuid     : this.getDataValue('uuid'),
					email    : this.getDataValue('email'),
					firstName: this.getDataValue('firstName'),
					lastName : this.getDataValue('lastName'),,
				})
			});
		} else {
			return next(new error.BadRequest('incorrect email or password'));
		}
	}).catch((err)=>{
		return next(new error.BadRequest('incorrect email or password'));
	});
});

router.post("/register", (req, res) => {
	res.json({ error: "Not implemented" });
});

module.exports = { router, configAuth, authenticated };
