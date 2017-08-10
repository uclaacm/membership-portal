const fs = require('fs');
const env = process.env.NODE_ENV || "development";

module.exports = {
	isProduction: (env === "production"),
	isDevelopment: (env !== "production"),

	host: process.env.HOST,
	port: process.env.PORT,

	numCPUs: process.env.NUM_WORKERS || require('os').cpus().length,
	
	database: {
		host: process.env.PG_HOST,
		port: process.env.PG_PORT,
		db: process.env.PG_DATABASE,
		user: process.env.PG_USER,
	},
	mailgun: {
		apiKey: process.env.MAILGUN_KEY,
		domain: 'mail.uclaacm.com',
	},
	session: {
		secret: fs.readFileSync('app/config/SESSION_SECRET').toString().trim(),
	},
	logging: {
		level: "debug",
	}
};
