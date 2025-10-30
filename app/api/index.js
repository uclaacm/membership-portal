const express = require('express');

const router = express.Router();

// route each API version
router.use('/v1', require('./v1').router);

module.exports = { router };
