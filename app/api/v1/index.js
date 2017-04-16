const express = require('express');
let router = express.Router();

// Route each API
router.use('/user', require('./user').router);
router.use('/event', require('./event').router);
router.use('/leaderboard', require('./leaderboard').router);

module.exports = { router };
