const env = process.env.NODE_ENV || "development";
const keys = require('./keys');

let config = {
	database: {},
	session: {},
	cache: {},
	logging: {}
};

if (env === "production") {
	config.port = process.env.PORT;
	config.host = process.env.HOST;
	config.numCPUs = process.env.WEB_CONCURRENCY;

	config.session.secret = process.env.SESSION_SECRET;
	config.session.uri = process.env.REDIS_URL;

	config.database.uri = process.env.MONGODB_URI;

	config.cache.uri = process.env.REDIS_URL;
	config.cache.keys = keys;

	config.logging.level = "debug";
} else {
	config.port = 5000;
	config.host = "http://localhost:" + config.port;
	config.numCPUs = require('os').cpus().length;
	
	config.session.secret = "77ea260f6918c0d8c3b6c35514d3b1a4fc69f01adbf7d2412611de97c3f0f2dc";
	config.session.uri = "redis://127.0.0.1:6379/0";
	
	config.database.uri = "postgres://acm:ACM_dev!@127.0.0.1/membership_portal";
	
	config.cache.uri = "redis://127.0.0.1:6379/0";
	config.cache.keys = keys;

	config.logging.level = "silly";
}

config.isProduction = env === "production";
config.isDevelopment = !config.isProduction;

module.exports = config;
