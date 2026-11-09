/**
 * Runs db.sync() to create base tables before migrations execute.
 * This is needed because all migrations are ALTER TABLE operations — they
 * require the base schema to exist first. On a fresh database, db.sync()
 * creates all tables; on an existing database it is a no-op.
 */
const { setup } = require('../app/db');

setup(false, false)
  .then(() => {
    console.log('DB tables initialized.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('DB init failed:', err.message);
    process.exit(1);
  });
