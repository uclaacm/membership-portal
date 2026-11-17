const express = require('express');
const config = require('../../../../config');
const error = require('../../../../error');
const db = require('../../../../db');
const { authenticated } = require('../../auth');

const router = express.Router();

/**
 * Get some health statistics about the application for monitoring purposes.
 */
router.get('/', (req, res) => {
  res.json({
    cpu: process.cpuUsage(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

/**
 * This route force resets the database (drops every Postgres table) and adds test dummy data.
 * Useful for testing, but horribly dangerous anywhere shared.
 *
 * "Development" is any NODE_ENV other than 'production', which includes staging, so the
 * environment check alone isn't enough: it also requires a super admin. It is a POST so that
 * a link, crawler or browser prefetch can't trigger it.
 */
router.post('/setup', authenticated, (req, res, next) => {
  if (!config.isDevelopment) {
    return next(
      new error.Forbidden('This route cannot be accessed in production'),
    );
  }
  if (!req.user.isSuperAdmin()) {
    return next(new error.Forbidden());
  }
  return db.setup(true, true).then((v) => res.json(v));
});

module.exports = { router };
