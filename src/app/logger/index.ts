import { config } from '../config';
import * as winston from 'winston';

/**
 * Logger to be used across the entire application
 */
export const logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ colorize: true })
	]
});

/* only log if the logged level is greater than or equal to the min level */
logger.level = config.logging.level;
