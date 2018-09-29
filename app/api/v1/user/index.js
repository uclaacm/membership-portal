const express = require('express');
const error = require('../../../error');
const { User, Activity } = require('../../../db');
const router = express.Router();

/**
 * Get user profile for current user
 */
router.route('/')
.get((req, res, next) => {
	res.json({ error: null, user: req.user.getUserProfile() });
})
/**
 * Update user information given a 'user' object with fields to update and updated information
 */
.patch((req, res, next) => {
	if (!req.body.user)
		return next(new error.BadRequest());

	// construct new, sanitized object of update information
	const updatedInfo = {};
	// for each field { fistName, lastName, major, year }
	//   check that it is a valid input and it has changed
	if (req.body.user.firstName && req.body.user.firstName.length > 0 && req.body.user.firstName !== req.user.firstName)
		updatedInfo.firstName = req.body.user.firstName;
	if (req.body.user.lastName && req.body.user.lastName.length > 0 && req.body.user.lastName !== req.user.lastName)
		updatedInfo.lastName = req.body.user.lastName;
	if (req.body.user.major && req.body.user.major.length > 0 && req.body.user.major !== req.user.major)
		updatedInfo.major = req.body.user.major;
	if (req.body.user.year && parseInt(req.body.user.year) !== NaN && parseInt(req.body.user.year) > 0 && parseInt(req.body.user.year) <= 5 && req.body.user.year !== req.user.year)
		updatedInfo.year = parseInt(req.body.user.year);

	// CASE: user wants to change password and has specified both fields
	if (req.body.user.newPassword && req.body.user.confPassword) {
		// basic checks (equality, length)
		if (req.body.user.newPassword !== req.body.user.confPassword)
			return next(new error.UserError('Passwords do not match'));
		if (req.body.user.newPassword.length < 10)
			return next(new error.UserError('New password must be at least 10 characters'));

		// verify that the old password is specified and is correct
		req.user.verifyPassword(req.body.user.password).then(verified => {
			if (!verified)
				throw new error.UserError('Incorrect current password');
			// generate hash for updated password
			return User.generateHash(req.body.user.newPassword);
		}).then(hash => {
			// add the hash to the updated info object and update the user with all
			// updated info
			updatedInfo.hash = hash;
			return req.user.update(updatedInfo);
		}).then(user => {
			// respond with the newly updated user profile
			res.json({ error: null, user: user.getPublicProfile() });
			// record that the user changed some account information, and what info was changed
			Activity.accountUpdatedInfo(user.uuid, Object.keys(updatedInfo).join(", "));
		}).catch(next);

	// CASE: user specified either new password or confirm password, but not both
	} else if (!!req.body.user.newPassword ^ !!req.body.user.confPassword) {
		return next(new error.UserError('Passwords do not match'));

	// CASE: user does not want to change password
	} else {
		// update the user information normally (with the given information, without any password changes)
		req.user.update(updatedInfo).then(user => {
			// respond with the newly updated user profile
			res.json({ error: null, user: user.getUserProfile() });
			// record that the user changed some account information, and what info was changed
			Activity.accountUpdatedInfo(user.uuid, Object.keys(updatedInfo).join(", "));
		}).catch(next);
	}
});

/**
 * Get the user's public activity (account creation, attend events, etc.)
 */
router.get('/activity', (req, res, next) => {
	Activity.getPublicStream(req.user.uuid).then(activity => {
	  res.json({ error: null, activity: activity.map(a => a.getPublic()) });
	}).catch(next);
});

/**
 * For all further requests on this route, the user needs to be an admin
 */
router.route('/milestone')
.all((req, res, next) => {
	if (!req.user.isAdmin())
		return next(new error.Forbidden());
	return next();
})
.post((req, res, next) => {
	if (!req.body.milestone || !req.body.milestone.name || typeof req.body.milestone.name !== 'string')
		return next(new error.BadRequest("Invalid request format"));
	
	User.findAll({}).then(users => {
		users.forEach(user => {
			Activity.createMilestone(user.uuid, req.body.milestone.name, user.points)
			if (req.body.milestone.resetPoints) {
				user.update({ points: 0 });
			}
		});
	}).then(() => res.json({ error: null })).catch(next);
})

module.exports = { router };
