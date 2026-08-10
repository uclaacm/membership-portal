const fs = require('fs');
const os = require('os');

const env = process.env.NODE_ENV || 'development';

const SESSION_SECRET_PATH = 'app/config/SESSION_SECRET';

/**
 * Resolves the token-signing secret.
 *
 * Environment first so deployments can pin a stable secret; the generated file is the
 * local-dev fallback. Throws with an actionable message rather than the raw ENOENT if neither
 * is present, since a missing secret means no user can authenticate at all.
 */
function readSessionSecret() {
  const fromEnv = (process.env.SESSION_SECRET || '').trim();
  if (fromEnv) return fromEnv;

  try {
    return fs.readFileSync(SESSION_SECRET_PATH).toString().trim();
  } catch (err) {
    throw new Error(
      `No session secret available: set SESSION_SECRET in the environment, or generate ${SESSION_SECRET_PATH} (make setup does this).`,
    );
  }
}

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
  numCPUs: process.env.NUM_WORKERS || os.cpus().length,

  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    authDomain: process.env.GOOGLE_AUTH_DOMAIN,
    clientId: process.env.GOOGLE_CLIENT_ID,
    allowedDomains: ['g.ucla.edu', 'ucla.edu', 'uclaacm.com'],
    adminDomain: 'uclaacm.com',
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

  // Secret used to sign session tokens.
  //
  // Prefers SESSION_SECRET from the environment, falling back to the generated file. The file
  // is gitignored, so it does not exist in a fresh checkout and the Dockerfile mints a new one
  // at image build time — which silently invalidated every issued JWT on every deploy and
  // forced all users to sign in again. Setting SESSION_SECRET in node.env keeps sessions alive
  // across rebuilds; the file remains the local-dev default so `make dev` needs no setup.
  session: {
    secret: readSessionSecret(),
  },

  // logging level
  logging: {
    level: 'info',
  },
};
