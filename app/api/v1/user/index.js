const express = require('express');
const User = require('../../../db').User;
const error = require('../../../error');
let router = express.Router();

router.route('/')
.get((req, res, next) => {
    res.json({ error: null, user: req.user.getUserProfile() });
})
.patch((req, res, next) => {
    if (!req.body.user)
        return next(new error.BadRequest());
    // if (!req.body.user.password)
    //     return next(new error.BadRequest('The password field is required'));

    req.user.verifyPassword(req.body.user.password).then(verified => {
        if (!verified)
            throw new error.Unauthorized('Invalid password');

        if (req.body.user.firstName && req.body.user.firstName.length > 0)
            req.user.firstName = req.body.user.firstName;
        if (req.body.user.lastName && req.body.user.lastName.length > 0)
            req.user.lastName = req.body.user.lastName;
        if (req.body.user.major && req.body.user.major.length > 0)
            req.user.major = req.body.user.major;
        if (req.body.user.year && parseInt(req.body.user.year) > 0)
            req.user.year = parseInt(req.body.user.year);

        if (req.body.user.newPassword && req.body.user.confPassword) {
            if (req.body.user.newPassword !== req.body.user.confPassword)
                throw new error.UserError('Passwords do not match');
            if (req.body.user.newPassword.length < 8)
                throw new error.UserError('New password must be at least 8 characters');
            return req.user.updatePassword(req.body.user.newPassword);
        } else if (!!req.body.user.newPassword ^ !!req.body.user.confPassword) {
            throw new error.UserError('Passwords do not match');
        }
    }).then(req.user.save).then((user) => {
        res.json({ error: null, user: user.getUserProfile() });
    }).catch(next);
});

module.exports = { router };
