const express = require('express')
const router = express.Router();

// route each API version
router.use('/events', require('./events').router);
router.use('/timeseries', require('./timeseries').router);

module.exports = { router };
