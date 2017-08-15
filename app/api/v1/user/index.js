const express = require('express');
const error = require('../../../error');
const { User, Activity } = require('../../../db');
const router = express.Router();

router.route('/')
.get((req, res, next) => {
	res.json({ error: null, user: req.user.getUserProfile() });
})
.patch((req, res, next) => {
	if (!req.body.user)
		return next(new error.BadRequest());

	const updatedInfo = {};
	if (req.body.user.firstName && req.body.user.firstName.length > 0 && req.body.user.firstName !== req.user.firstName)
		updatedInfo.firstName = req.body.user.firstName;
	if (req.body.user.lastName && req.body.user.lastName.length > 0 && req.body.user.lastName !== req.user.lastName)
		updatedInfo.lastName = req.body.user.lastName;
	if (req.body.user.major && req.body.user.major.length > 0 && req.body.user.major !== req.user.major)
		updatedInfo.major = req.body.user.major;
	if (req.body.user.year && parseInt(req.body.user.year) > 0 && req.body.user.year !== req.user.year)
		updatedInfo.year = parseInt(req.body.user.year);

	if (req.body.user.newPassword && req.body.user.confPassword) {
		if (req.body.user.newPassword !== req.body.user.confPassword)
			return next(new error.UserError('Passwords do not match'));
		if (req.body.user.newPassword.length < 10)
			return next(new error.UserError('New password must be at least 10 characters'));

		req.user.verifyPassword(req.body.user.password).then(verified => {
			if (!verified)
				throw new error.UserError('Incorrect current password');
			return User.generateHash(req.body.user.newPassword);
		}).then(hash => {
			updatedInfo.hash = hash;
			return req.user.update(updatedInfo);
		}).then(user => {
			res.json({ error: null, user: user.getPublicProfile() });
			Activity.accountUpdatedInfo(user.uuid, Object.keys(updatedInfo).join(", "));
		}).catch(next);
	} else if (!!req.body.user.newPassword ^ !!req.body.user.confPassword) {
		return next(new error.UserError('Passwords do not match'));
	} else {
		req.user.update(updatedInfo).then(user => {
			res.json({ error: null, user: user.getUserProfile() });
			Activity.accountUpdatedInfo(user.uuid, Object.keys(updatedInfo).join(", "));
		}).catch(next);
	}
});

router.get('/activity', (req, res, next) => {
	Activity.getPublicStream(req.user.uuid).then(activity => {
	  res.json({ error: null, activity: activity.map(a => a.getPublic()) });
	}).catch(next);
});

module.exports = { router };
