const express = require('express');
const auth = require('./auth').authenticated;
let router = express.Router();

// Private API - use authentication middleware
router.use('/user', auth, require('./user').router);
router.use('/event', auth, require('./event').router);
router.use('/attendance', auth, require('./attendance').router);
router.use('/leaderboard', require('./leaderboard').router);

// Public API
router.use('/auth', require('./auth').router);
router.use('/health', require('./health').router);

module.exports = { router };
