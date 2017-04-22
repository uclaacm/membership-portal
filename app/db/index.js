const Sequelize = require('sequelize');
const logger = require('../logger');
const config = require('../config');
const error = require('../error');

let db = new Sequelize(config.database.db, config.database.user, config.database.password, {
	dialect: 'postgres',
	host: config.database.host,
	logging: config.isDevelopment ? logger.debug : false
});

let User = require('./schema/user')(Sequelize, db);
let Event = require('./schema/event')(Sequelize, db);
let Attendance = require('./schema/attendance')(Sequelize, db);

let setup = () => {
	db.sync().then(() => {
		if (config.isDevelopment) {
			User.findOrCreate({ where: { email: 'admin@ucla.edu' }, defaults: {
				email: 'admin@ucla.edu',
				accessType: 'ADMIN',
				state: 'ACTIVE',
				firstName: 'Nikhil',
				lastName: 'Kansal',
				hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
				year: 2,
				major: 'Computer Science'
			}});
		}
	});
};

let errorHandler = (err, req, res, next) => {
	if (!err || !(err instanceof Sequelize.Error))
		return next(err);
	if (err instanceof Sequelize.ValidationError)
		return next(error.HTTPError(err.name, 422, err.message))
	return next(error.HTTPError(err.name, 500, err.message));
};

module.exports = { User, Event, Attendance, setup, errorHandler }; 
