const express = require("express");
const rateLimit = require("express-rate-limit");
const auth = require("./auth").authenticated;
let router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Private API - use authentication middleware
router.use("/register", auth, require("./register").router);
router.use("/user", auth, require("./user").router);
router.use("/event", auth, require("./event").router);
router.use("/attendance", auth, require("./attendance").router);
router.use("/leaderboard", auth, require("./leaderboard").router);
router.use("/rsvp", auth, require("./rsvp").router);

// Public API
router.use("/auth", require("./auth").router);
router.use("/health", require("./health").router);

// One-click API
router.use("/one-click", apiLimiter, require("./one-click").router);

module.exports = { router };
