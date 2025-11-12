const app = require('../../../..');

const log = app.logger;

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  log.error('Error:', error);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
