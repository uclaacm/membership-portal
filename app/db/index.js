const Sequelize = require('sequelize');
const logger = require('../logger');
const config = require('../config');
const error = require('../error');

let db = new Sequelize(config.database.db, config.database.user, config.database.password, {
    dialect: 'postgres',
    host: config.database.host,
    logging: config.isDevelopment ? logger.debug : false
})

let User = require('./schema/user')(Sequelize, db);
let Event = require('./schema/event')(Sequelize, db);
let Attendance = require('./schema/attendance')(Sequelize, db);

let setup = (force) => {
    db.sync({ force: !!force });
};

let errorHandler = (err, req, res, next) => {
    if (!err || !(err instanceof Sequelize.Error))
        return next(err);
    if (err instanceof Sequelize.ValidationError)
        return next(error.HTTPError(err.name, 422, err.message))
    return next(error.HTTPError(err.name, 500, err.message));
};

module.exports = { User, Event, Attendance, setup, errorHandler }; 
