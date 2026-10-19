const cluster = require('cluster');
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const app = require('./app');
const { connectDB } = require('./app/api/v1/internship/config/database');

const log = app.logger;
const server = express();

// enable CORS in development
if (app.config.isDevelopment) {
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.header(
      'Access-Control-Allow-Methods',
      'GET, PUT, POST, PATCH, DELETE, OPTIONS',
    );

    if (req.method.toLowerCase() === 'options') res.status(200).end();
    else next();
  });
}

// Add Cross-Origin-Opener-Policy header
server.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Assign a unique ID to each request
server.use((req, res, next) => {
  req.id = uuid.v4().split('-').pop();
  res.set('X-Flow-Id', req.id);
  next();
});

// Enable logging for debugging and tracing purposes
server.use(
  morgan(
    ':date[web] [IP :req[X-Forwarded-For]] [Flow :res[X-Flow-Id]] :method :url :status :response-time[3]ms',
  ),
);

// Parse urlencoded and json POST data
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Route the API
server.use('/app/api', app.api.router);

// Register error middleware
server.use(app.db.errorHandler);
server.use(app.error.errorHandler);
server.use(app.error.notFoundHandler);

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Setup Postgres (or other DB)
    await app.db.setup(false, app.config.isDevelopment);

    if (cluster.isMaster) {
      log.debug('Creating %d cluster workers...', app.config.numCPUs);
      for (let i = 0; i < app.config.numCPUs; i++) cluster.fork();

      cluster.on('exit', (worker, code, signal) => {
        log.info(
          'Worker PID %s died (%s). Restarting...',
          worker.process.pid,
          signal,
        );
        log.info('FORKING');
        cluster.fork();
      });
    }
    if (!cluster.isMaster) {
      server.listen(app.config.port, app.config.host, async () => {
        log.info(
          'Started server %s on port %d, PID: %d',
          app.config.host,
          app.config.port,
          process.pid,
        );
        log.log(`Server is running on port ${app.config.port}`);
        log.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    }
  } catch (error) {
    log.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
} else {
  const HTTPserver = server.listen(app.config.port, app.config.host, () => {
    log.info(
      'Started TEST server %s on port %d, PID: %d',
      app.config.host,
      app.config.port,
      process.pid,
    );
  });
  module.exports = { server: HTTPserver, setup: app.db.setup };
}
