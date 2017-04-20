const express = require('express');
const config = require('../config');
const error = require('../error');
const log = require('../logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let passport = require('passport');
let User = require('../db').User;
let router = express.Router();


const dayseconds = 86400;
const dayweek = dayseconds * 6;


let configAuth = (server) => {
};

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
		// TODO: update secret
		jwt.verify(token, 'secret', (err, decoded)=>{
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
	if(!req.body.email || req.body.email.length < 1){
		return next(new error.BadRequest('email must be provided'));
	}
	if(!req.body.password || req.body.password.length < 1){
		return next(new error.BadRequest('password must be provided'));
	}
	User.findByEmail(req.body.email).then((user)=>{
		// TODO:
		// - update secret
		// - add admin to payload
		// - salt field is not used on user model
		bcrypt.compare(req.body.password, user.getDataValue('hash')).then((verified) => {
		  if(verified){
				jwt.sign({
					uuid     : user.getDataValue('uuid'),
					email    : user.getDataValue('email'),
					firstName: user.getDataValue('firstName'),
					lastName : user.getDataValue('lastName'),
					admin    : false
				}, 'secret', {expiresIn: dayseconds}, (err, token)=>{
					if(err){
						return next(new error.BadRequest(err.message));
					}
					res.json({
						token: token
					});
				});
			} else {
				return next(new error.BadRequest('incorrect email or password'));
			}
		});
	}).catch((err)=>{
		return next(new error.BadRequest('incorrect email or password'));
	});
});

router.post("/register", (req, res) => {
	res.json({ error: "Not implemented" });
});

module.exports = { router, configAuth, authenticated };
