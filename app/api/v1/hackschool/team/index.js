const express = require('express');
let router = express.Router();

// Route each Team API
router.use('/score', require('./score').router);
module.exports = { router };
