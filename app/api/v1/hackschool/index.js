const express = require('express');
let router = express.Router();

// Route each Hack School API
router.use('/team', require('./team').router);
router.use('/session', require('./session').router);
module.exports = { router };
