import fs from "fs";
const env = process.env.NODE_ENV || "development";

/**
 * Application configuration
 *
 * It depends mostly on reading environment variables or extenal data
 * to avoid hardcoding and make changing runtimes and updating the app easy
 */
export const config = {
  /** primary database connection information */
  database: {
    db: process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
  },

  /** host to bind the server on */
  host: process.env.HOST,

  /** whether the app is running in development  */
  isDevelopment: (env !== "production"),

  /** whether the app is running in production */
  isProduction: (env === "production"),

  /** logging settings */
  logging: {
    /** min level to log */
    level: "debug",
  },

  /** mailgun information */
  mailgun: {
    apiKey: process.env.MAILGUN_KEY || " ",
    domain: "mail.uclaacm.com",
  },

  /** determines the amount of processes to run that handle API requests */
  numCPUs: process.env.NUM_WORKERS || require("os").cpus().length,

  /** port to bind the server on */
  port: process.env.PORT,

  /** session information */
  session: {
    /** secret for signing token (warning: assumes the file exists) */
    secret: fs.readFileSync("dist/app/config/SESSION_SECRET").toString().trim(),
  },
};
