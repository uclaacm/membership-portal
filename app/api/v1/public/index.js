const express = require('express');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const router = express.Router();

// Read-only, unauthenticated, and served to anyone. Nothing mounted under this router may read
// req.user, a session, or a cookie — see the CORS note below for why that is load-bearing.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 300;

// Events change on the order of days, so letting caches absorb repeat traffic is worth far more
// than the rate limiter below. A committee site rendering its events page on every visit hits a
// cache, not the database.
const CACHE_MAX_AGE_SECONDS = 300;

/**
 * The forwarded client address, or null when there isn't one.
 *
 * Returns null rather than falling back to req.ip on purpose. The app sits behind the Next.js
 * standalone server, which proxies /app/api/* to the backend and does *not* add an
 * X-Forwarded-For header — every request currently arrives with the proxy's own address. See
 * the limiter below for what that means.
 */
function forwardedClient(req) {
  const forwarded = req.get && req.get('x-forwarded-for');
  if (!forwarded) return null;
  const first = forwarded.split(',')[0].trim();
  return first || null;
}

/**
 * Per-client rate limit — inactive until the proxy forwards a client address.
 *
 * `skip` is the important part. Without X-Forwarded-For every request keys to the same proxy
 * address, so a "per-IP" limit would really be one bucket shared by the entire internet *and*
 * by the portal's own UI, whose server actions reach the backend through that same proxy. One
 * scraper would then 429 real users. A limiter with that failure mode is worse than none, so
 * this one stands down when it cannot tell clients apart, and starts working on its own the
 * day the proxy forwards an address.
 *
 * Making that day arrive is a separate change with app-wide blast radius: the Next config must
 * forward X-Forwarded-For, and Express needs `trust proxy` set (app/audit.js documents the same
 * gap and hand-parses the header for the same reason).
 */
const publicApiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => forwardedClient(req) === null,
  keyGenerator: (req) => ipKeyGenerator(forwardedClient(req)),
  // This limiter reads the header itself rather than trusting req.ip, so the library's check
  // for "X-Forwarded-For present but trust proxy unset" does not apply to it.
  validate: { xForwardedForHeader: false },
  handler: (req, res) => {
    res.status(429).json({
      error: { status: 429, message: 'Too many requests. Please try again later.' },
    });
  },
});

/**
 * CORS for the public API only.
 *
 * A wildcard origin is safe *because* nothing under this router is authenticated: there is no
 * cookie or session for a hostile page to ride, and Access-Control-Allow-Credentials is
 * deliberately never set. The same header on the authenticated routes would be a real
 * vulnerability, which is why this lives on the public router instead of in the server-wide
 * middleware — where, today, CORS is enabled only in development anyway.
 */
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Accept, Content-Type');
  res.header('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  res.header('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SECONDS}`);
  next();
});

router.use(publicApiLimiter);

router.use('/events', require('./events').router);

module.exports = { router };
