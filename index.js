const cluster = require('cluster');
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');
const compression = require('compression');
const bodyParser = require('body-parser');
const app = require('./app');
const log = app.logger;
let server = express();

// enable CORS in development
if (app.config.isDevelopment) {
	server.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
		res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE, OPTIONS");

		if (req.method.toLowerCase() === "options")
			res.status(200).end();
		else next();
	});
}

// Assign a unique ID to each request
server.use((req, res, next) => {
	req.id = uuid.v4();
	res.set('X-Flow-Id', req.id);
	next();
});

// Use gzip compression to reduce bandwidth usage
server.use(compression());

// Enable logging for debugging and tracing purposes
server.use(morgan(':date[web] [IP :req[X-Forwarded-For]] [Flow :res[X-Flow-Id]] ":method :url" :status :response-time[3]ms'));

// Parse urlencoded and json POST data
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Route the API
server.use('/app/api', app.api.router);

// Register error middleware
server.use(app.db.errorHandler);
server.use(app.error.errorHandler);
server.use(app.error.notFoundHandler);

// Create workers
if (cluster.isMaster) {
	// perform DB initialization once
	app.db.setup();

	log.debug("Creating %d cluster workers...", app.config.numCPUs);
	for (let i = 0; i < app.config.numCPUs; i++)
		cluster.fork();
	
	cluster.on('exit', (worker, code, signal) => {
		log.info("Worker PID %s died (%s). Restarting...", worker.process.pid, signal);
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
