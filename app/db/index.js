const Sequelize = require('sequelize');
const logger = require('../logger');
const config = require('../config');

let db = new Sequelize(config.database.uri, { logging: config.isDevelopment ? logger.debug : false });

let User = require('./schema/user')(Sequelize, db);
let Event = require('./schema/event')(Sequelize, db);

let setup = (force) => {
    db.sync({ force: !!force });
};

module.exports = { User, Event, setup }; 
