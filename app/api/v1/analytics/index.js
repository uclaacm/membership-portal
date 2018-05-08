const express = require('express')
const router = express.Router();

// route each API version
router.use('/', require('./analytics').router);

module.exports = { router };
