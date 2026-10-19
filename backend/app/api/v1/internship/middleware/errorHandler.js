const app = require('../../../..');

const log = app.logger;

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  log.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.statusCode ? error.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
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
