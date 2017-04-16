const express = require('express');
const error = require('../../../error');
let router = express.Router();

router.route('/')
.get((req, res, next) => {
    next(new error.NotImplemented());
});

module.exports = { router };
