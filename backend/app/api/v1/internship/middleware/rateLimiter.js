/**
 * RATE LIMITING STRATEGY:
 * * We use a two-tiered rate limiting approach for application submissions:
 * * 1. createApplicationLimiter (Infrastructure Protection):
 * - Limit: 250 requests/hour.
 * - Purpose: Acts as a "safety net" to prevent bot spam or DDoS attacks from
 * crashing the server, especially during high-traffic "deadline rushes."
 * - Usage: General-purpose protection for create/update endpoints.
 * * 2. strictCreateApplicationLimiter (Business Logic Enforcement):
 * - Limit: 10 requests/hour.
 * - Purpose: Strictly enforces the project's Acceptance Criteria. It prevents
 * users from "brute-forcing" submissions or spamming the database with
 * half-finished applications.
 * - Usage: Should be applied to the primary 'Submit Application' POST route.
 * * Both limiters use the User UUID as the key to ensure fairness across shared
 * campus IP addresses.
 */
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const {
  CREATE_RATE_LIMIT_WINDOW_MS,
  CREATE_RATE_LIMIT_MAX,
} = require('../config/constants');

const createApplicationLimiter = rateLimit({
  windowMs: CREATE_RATE_LIMIT_WINDOW_MS, // 1 hour from constants
  max: CREATE_RATE_LIMIT_MAX, // 250 submissions per hour

  // Use user's UUID as the key instead of IP
  // This ensures rate limiting is per-user, not per-IP
  keyGenerator: (req) => (req.user ? req.user.uuid : ipKeyGenerator(req.ip)),

  // Customize error message
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many submission attempts. Please try again in an hour.',
    });
  },

  // Return rate limit info in headers
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers

  // Skip rate limiting for failed requests (only count successful attempts)
  skipFailedRequests: true,

  // Skip rate limiting for successful requests that result in duplicate errors
  skipSuccessfulRequests: false,
});

const strictCreateApplicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 submissions per hour per user

  keyGenerator: (req) => (req.user ? req.user.uuid : ipKeyGenerator(req.ip)),

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'You have exceeded the maximum number of submission attempts (10 per hour). Please try again later.',
    });
  },

  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

// Committee rate limiter (general API protection, not user-specific)
const committeeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const getApplicationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
  createApplicationLimiter,
  strictCreateApplicationLimiter,
  committeeRateLimiter,
  getApplicationsLimiter,
};
