const express = require('express')
let router = express.Router();

// route each API version
router.use('/events', require('./events').router);

module.exports = { router };
