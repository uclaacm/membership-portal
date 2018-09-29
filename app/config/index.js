const fs = require('fs');
const env = process.env.NODE_ENV || "development";

/**
 * Application configuration
 * 
 * It depends mostly on reading environment variables or extenal data
 * to avoid hardcoding and make changing runtimes and updating the app easy
 */
module.exports = {
	isProduction: (env === "production"),
	isDevelopment: (env !== "production"),

	host: process.env.HOST,
	port: process.env.PORT,

	// determines the amount of processes to run that handle API requests
	numCPUs: process.env.NUM_WORKERS || require('os').cpus().length,
	
	// primary database connection information
	database: {
		host: process.env.PG_HOST,
		port: process.env.PG_PORT,
		db: process.env.PG_DATABASE,
		user: process.env.PG_USER,
	},

	// mail information
	mailgun: {
		apiKey: process.env.MAILGUN_KEY || " ",
		domain: 'mail.uclaacm.com',
	},

	// session secret for signing token (warning: assumes the file exists)
	session: {
		secret: fs.readFileSync('app/config/SESSION_SECRET').toString().trim(),
	},
	
	// logging level
	logging: {
		level: "info",
	}
};
