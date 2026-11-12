const Sequelize = require('sequelize');
const cls = require('continuation-local-storage');

const logger = require('../logger');
const config = require('../config');
const error = require('../error');
const devSetup = require('./dev-setup');

// The transaction namespace to use for transactions
const transactionNamespace = cls.createNamespace('default-transaction-ns');
Sequelize.useCLS(transactionNamespace);

// https://stackoverflow.com/questions/65417340/docker-compose-postgres-restart-after-running-scripts-in-docker-entrypoint-initd/65417566#65417566
// The DB instance managed by sequelize
const db = new Sequelize(
  config.database.db,
  config.database.user,
  config.database.password,
  {
    dialect: 'postgres',
    host: config.database.host,
    // PG_PORT arrives as a string (or not at all); fall back to the Postgres default.
    port: Number(config.database.port) || 5432,
    logging: config.isDevelopment ? logger.debug : false, // false as a function
  },
);

// Create schemas
const User = require('./schema/user')(Sequelize, db);
const Event = require('./schema/event')(Sequelize, db);
const Activity = require('./schema/activity')(Sequelize, db);
const Attendance = require('./schema/attendance')(Sequelize, db);
const Secret = require('./schema/secret')(Sequelize, db);
const RSVP = require('./schema/rsvp')(Sequelize, db);
const Image = require('./schema/image')(Sequelize, db);
const AuditLog = require('./schema/audit')(Sequelize, db);

/**
 * DB setup function to sync tables and add admin if doesn't exist
 */
const setup = async (force, dev) => {
  // Every step is awaited so that `await setup()` means the database is actually ready.
  // Callers (tests, scripts/db-init.js, index.js) rely on that to not race the seeding.
  try {
    await db.authenticate();
    logger.info('Connection has been established successfully.');
  } catch (err) {
    logger.error('Unable to connect to the database:', err);
    throw err;
  }

  await db.sync({ force });
  if (dev) await devSetup(User, Event);

  // Seeding the one-click secret and admin is non-fatal: scripts/db-init.js runs this before
  // migrations at container start, and a seed failure must not block the migrations from running.
  try {
    const hash = await Secret.generateHash('password');
    await Secret.findOrCreate({
      where: { name: 'one-click' },
      defaults: { hash },
    });
  } catch (err) {
    logger.error('Error creating secret:', err);
  }

  try {
    await User.findOrCreate({
      where: { email: 'acm@g.ucla.edu' },
      defaults: {
        email: 'acm@g.ucla.edu',
        accessType: 'ADMIN',
        state: 'ACTIVE',
        firstName: 'ACM',
        lastName: 'Admin',
        year: 4,
        major: 'Computer Science',
      },
    });
  } catch (err) {
    logger.error('Error creating admin user:', err);
  }

  return null;
};

/**
 * Handles database errors (separate from the general error handler and the 404 error handler)
 *
 * Specifically, it intercepts validation errors and presents them to the user in a readable
 * manner. All other errors it lets fall through to the general error handler middleware.
 */
const errorHandler = (err, req, res, next) => {
  if (!err || !(err instanceof Sequelize.Error)) return next(err);
  if (err instanceof Sequelize.ValidationError) {
    const message = `Validation Error: ${err.errors
      .map((e) => e.message)
      .join('; ')}`;
    return next(new error.HTTPError(err.name, 422, message));
  }
  return next(new error.HTTPError(err.name, 500, err.message));
};

module.exports = {
  db, User, Event, Activity, Attendance, Secret, RSVP, Image, AuditLog, setup, errorHandler,
};
