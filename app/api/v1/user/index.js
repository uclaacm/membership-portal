const express = require('express');
const app = require('../../..');
const User = app.db.User;
let router = express.Router();

router.route('/')
.get((req, res, next) => {
    res.json({ error: null, user: req.user.getUserProfile() });
})
.patch((req, res, next) => {
    if (!req.body.user.password)
        return next(new app.error.BadRequest('Missing password field'));

    req.user.verifyPassword(req.body.user.password).then(verified => {
        if (!verified)
            throw new app.error.Unauthorized('Invalid credentials');

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
                throw new app.error.BadRequest('Passwords do not match');
            return User.generateSaltAndHash(req.body.user.newPassword).then((salt, hash) => {
                req.user.hash = hash;
                req.user.salt = salt;
            });
        }
    }).then(req.user.save).then((user) => {
        res.json({ error: null, user: user.getUserProfile() });
    }).catch(next);
});

module.exports = { router };
