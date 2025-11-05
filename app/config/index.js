const fs = require('fs');

const env = process.env.NODE_ENV || 'development';

/**
 * Application configuration
 *
 * It depends mostly on reading environment variables or extenal data
 * to avoid hardcoding and make changing runtimes and updating the app easy
 */
module.exports = {
  isProduction: env === 'production',
  isDevelopment: env !== 'production',

  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 8080,

  // determines the amount of processes to run that handle API requests
  numCPUs: process.env.NUM_WORKERS || require('os').cpus().length,

  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    authDomain: process.env.GOOGLE_AUTH_DOMAIN,
    clientId: process.env.GOOGLE_CLIENT_ID,
    hostedDomain: 'g.ucla.edu',
  },

  sheets: {
    serviceAcct: process.env.SERVICE_ACCOUNT,
    eventsSheetId: process.env.EVENTS_SPREADSHEET_ID,
  },

  // primary database connection information
  database: {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    db: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
  },

  // session secret for signing token (warning: assumes the file exists)
  session: {
    secret: fs.readFileSync('app/config/SESSION_SECRET').toString().trim(),
  },

  // logging level
  logging: {
    level: 'info',
  },
};
