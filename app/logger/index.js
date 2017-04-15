const config = require('../config');
const winston = require('winston');
const logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ colorize: true })
	]
});

logger.level = config.logging.level;
module.exports = logger;
