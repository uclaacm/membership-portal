const logger = require('../logger');

/**
 * This file defines error classes based on their semantic meaning. It abstracts away
 * HTTP status codes so they can be used in a RESTful way without worrying about a
 * consistent error interface.
 *
 * These classes descend from the base Error class, so they also automatically capture
 * stack traces -- useful for debugging.
 */

/**
 * Base error class
 *
 * Supports HTTP status codes and a custom message
 */
class HTTPError extends Error {
  constructor(name, status, message) {
    let localName = name;
    let localStatus = status;
    let localMessage = message;
    if (localMessage === undefined) {
      localMessage = localStatus;
      localStatus = localName;
      localName = undefined;
    }

    super(localMessage);

    this.name = localName || this.constructor.name;
    this.status = localStatus;
    this.message = localMessage;
  }
}

class UserError extends HTTPError {
  constructor(message) {
    super(200, message || 'User Error');
  }
}

class BadRequest extends HTTPError {
  constructor(message) {
    super(400, message || 'Bad Request');
  }
}

class Unauthorized extends HTTPError {
  constructor(message) {
    super(401, message || 'Unauthorized');
  }
}

class Forbidden extends HTTPError {
  constructor(message) {
    super(403, message || 'Permission denied');
  }
}

class NotFound extends HTTPError {
  constructor(message) {
    super(404, message || 'Resource not found');
  }
}

// class Unprocessable extends HTTPError {
//   constructor(message) {
//     super(422, message || 'Unprocessable request');
//   }
// }

class TooManyRequests extends HTTPError {
  constructor(message) {
    super(429, message);
  }
}

class InternalServerError extends HTTPError {
  constructor(message) {
    super(500, message || 'Internal server error');
  }
}

class NotImplemented extends HTTPError {
  constructor(message) {
    super(501, message || 'Not Implemented');
  }
}

class NotAvailable extends HTTPError {
  constructor(message) {
    super(503, message);
  }
}

/**
 * General error handler middleware. Attaches to express so that throwing or calling next() with
 * an error ends up here and all errors are handled uniformly.
 * NOTE: All error handlers MUST define four parameters to be recognized correctly by express.
 */
/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  let localErr = err;
  if (!localErr) localErr = new InternalServerError('An unknown error occurred');
  if (!localErr.status) localErr = new InternalServerError(localErr.message);

  if (localErr.status < 500) {
    logger.warn(
      '%s [Flow %s]: %s [%d]: %s',
      new Date(),
      req.id,
      localErr.name,
      localErr.status,
      localErr.message,
    );
  } else {
    logger.error('%s [Flow %s]: \n%s', new Date(), req.id, localErr.stack);
  }

  res.status(localErr.status).json({
    error: {
      status: localErr.status,
      message: localErr.message,
    },
  });
};

/**
 * 404 errors aren't triggered by an error object, so this is a catch-all middleware
 * for requests that don't hit a route.
 */
const notFoundHandler = (req, res) => {
  const notFoundErr = new NotFound(`The resource ${req.url} was not found`);
  logger.warn(
    '%s [Flow %s]: %s [%d]: %s',
    new Date(),
    req.id,
    notFoundErr.name,
    notFoundErr.status,
    notFoundErr.message,
  );
  res.status(notFoundErr.status).json({
    error: {
      status: notFoundErr.status,
      message: notFoundErr.message,
    },
  });
};

module.exports = {
  HTTPError,
  UserError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  TooManyRequests,
  InternalServerError,
  NotImplemented,
  NotAvailable,
  errorHandler,
  notFoundHandler,
};
