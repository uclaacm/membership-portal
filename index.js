//const opbeat = require('opbeat').start();
const cluster = require('cluster');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const app = require('./app');
const log = app.logger;
let server = express();

// Use gzip compression to reduce bandwidth usage
server.use(compression());

// Enable logging for debugging and tracing purposes
server.use(morgan('dev'));

// Parse urlencoded and json POST data
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Hack Data API
server.use('/api', app.api.router);

// Use sessions
server.use(app.session);

// Configure authentication
app.auth.configAuth(server);
server.use('/auth', app.auth.router);

// Hack School routes (requires authentication)
server.use('/hackschool', app.auth.authenticated, app.hackschool.router);

// Register Opbeat monitoring error handler
if (app.config.isProduction)
	server.use(opbeat.middleware.express());

// Create workers
if (cluster.isMaster) {
	log.debug("Creating %d cluster workers...", app.config.numCPUs);
	for (let i = 0; i < app.config.numCPUs; i++)
		cluster.fork();
	
	cluster.on('exit', (worker, code, signal) => {
		log.info("Worker PID %s died. Restarting...", worker.process.pid);
		cluster.fork();
	});
} else {
	// Start the server on each worker
	server.listen(app.config.port, () => {
		log.info("Started server %s on port %d, PID: %d", app.config.host, app.config.port, process.pid);
	});
}

// For testing purposes
module.exports = server;
