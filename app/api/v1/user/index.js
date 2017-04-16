const express = require('express');
const error = require('../../../error');
let router = express.Router();

router.route('/')
.get((req, res, next) => {
    res.json({ error: null, user: req.user.getUserProfile() });
})
.post((req, res, next) => {
    next(new error.NotImplemented());
});

module.exports = { router };
