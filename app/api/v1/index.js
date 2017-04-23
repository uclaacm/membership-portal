const express = require('express');
const auth = require('./auth');
let router = express.Router();

// Route each API
router.use('/user', auth.authenticated(), require('./user').router);
router.use('/event', auth.authenticated(), require('./event').router);
router.use('/attendance', auth.authenticated(), require('./attendance').router);
router.use('/leaderboard', auth.authenticated(), require('./leaderboard').router);

// Public API
router.use('/auth', require('./auth').router);
router.use('/health', require('./health').router);

module.exports = { router };
