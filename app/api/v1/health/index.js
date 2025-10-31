const express = require('express');
const config = require('../../../config');
const error = require('../../../error');
const db = require('../../../db');

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
 * This route force resets the database and adds test dummy data. Useful for testing,
 * but horribly dangerous for production.
 */
router.get('/setup', (req, res, next) => {
  if (!config.isDevelopment) {
    return next(
      new error.Forbidden('This route cannot be accessed in production'),
    );
  }
  return db.setup(true, true).then(v => res.json(v));
});

module.exports = { router };
