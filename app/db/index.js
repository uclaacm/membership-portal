const Sequelize = require('sequelize');
const logger = require('../logger');
const config = require('../config');
const error = require('../error');
const devSetup = require('./dev-setup');

const db = new Sequelize(config.database.db, config.database.user, config.database.password, {
	dialect: 'postgres',
	host: config.database.host,
	logging: config.isDevelopment ? logger.debug : false
});

const User = require('./schema/user')(Sequelize, db);
const Event = require('./schema/event')(Sequelize, db);
const Activity = require('./schema/activity')(Sequelize, db);
const Attendance = require('./schema/attendance')(Sequelize, db);

const setup = (force, dev) => {
	return (dev ? db.sync({ force }).then(() => devSetup(User, Event, Attendance)) : db.sync({ force })).then(() => {
		User.findOrCreate({
			where: { email: 'acm@ucla.edu'},
			defaults: {
				email: 'acm@ucla.edu',
				accessType: 'ADMIN',
				state: 'ACTIVE',
				firstName: 'ACM',
				lastName: 'Admin',
				hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G',
				year: 4,
				major: 'Computer Science'
			}
    });
	});
};

const errorHandler = (err, req, res, next) => {
	if (!err || !(err instanceof Sequelize.Error))
		return next(err);
	if (err instanceof Sequelize.ValidationError) {
		const message = `Validation Error: ${err.errors.map(e => e.message).join('; ')}`;
		return next(new error.HTTPError(err.name, 422, message))
	}
	return next(new error.HTTPError(err.name, 500, err.message));
};

module.exports = { User, Event, Activity, Attendance, setup, errorHandler }; 
