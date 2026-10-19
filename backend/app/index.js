const db = require('./db');
const api = require('./api');
const error = require('./error');
const config = require('./config');
const logger = require('./logger');

module.exports = {
  db,
  api,
  error,
  config,
  logger,
};
