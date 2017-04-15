const express = require('express');
const config = require('../config');
const log = require('../logger');
let passport = require('passport');
let db = require('../db');
let router = express.Router();

let configAuth = (server) => {
	// TODO: Implement the passport-jwt strategy here

	// Serializing users: a user is represented by their ID
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	// Deserializing users: lookup a user by id (how we serialized) and find the 
	//   rest of the user info
	passport.deserializeUser((id, done) => {
		return db.User.findById(id).then(user => done(null, user)).catch(err => done(err, null));
	});

	// Let the express server use the passport.
	server.use(passport.initialize());
	
	// No need for sessions if we're using JWT
	//server.use(passport.session());
};

// middleware to determine whether a user is authenticated
let authenticated = (req, res, next) => {
	if (req.user) 
		return next();
	return next(new Error("Unauthorized access"));
};


// TODO: implement login 

router.post("/login", (req, res) => {
	res.json({ error: "Not implemented" });
});

router.post("/register", (req, res) => {
	res.json({ error: "Not implemented" });
});

module.exports = { router, configAuth, authenticated };
