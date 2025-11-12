const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('./auth').authenticated;

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Internship API - use authentication middleware and router
router.use('/internship', auth, require('./internship').router);

// Private API - use authentication middleware
router.use('/register', auth, require('./membership/register').router);
router.use('/user', auth, require('./membership/user').router);
router.use('/event', auth, require('./membership/event').router);
router.use('/attendance', auth, require('./membership/attendance').router);
router.use('/leaderboard', auth, require('./membership/leaderboard').router);
router.use('/rsvp', auth, require('./membership/rsvp').router);

// Can't authenticate CSS url(), so cannot force auth route-wide
router.use('/image', require('./membership/image').router);

// Mount the admin routes
router.use('/admin', require('./admin').router);

// Public API
router.use('/auth', require('./auth').router);
router.use('/health', require('./membership/health').router);

// One-click API
router.use('/one-click', apiLimiter, require('./membership/one-click').router);

module.exports = { router };
