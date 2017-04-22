const logger = require('../logger');

class HTTPError extends Error {
	constructor(name, status, message) {
		if (message === undefined){
			message = status;
			status = name;
			name = undefined;
		}

		super(message);
		
		this.name = name ? name : this.constructor.name;
		this.status = status;
		this.message = message;
	}
}

class UserError extends HTTPError {
	constructor(message) {
		super(200, message || "User Error");
	}
}

class BadRequest extends HTTPError {
	constructor(message) {
		super(400, message || "Bad Request");
	}
}

class Unauthorized extends HTTPError {
	constructor(message) {
		super(401, message || "Unauthorized");
	}
}

class Forbidden extends HTTPError {
	constructor(message) {
		super(403, message || "Permission denied");
	}
}

class NotFound extends HTTPError {
	constructor(message) {
		super(404, message || "Resource not found");
	}
}

class TooManyRequests extends HTTPError {
	constructor(message) {
		super(429, message);
	}
}

class InternalServerError extends HTTPError {
	constructor(message) {
		super(500, message || "Internal server error");
	}
}

class NotImplemented extends HTTPError {
	constructor(message) {
		super(501, message || "Not Implemented");
	}
}

class NotAvailable extends HTTPError {
	constructor(message) {
		super(503, message);
	}
}

let errorHandler = (err, req, res, next) => {
	if (!err)
		err = new InternalServerError("An unknown error occurred");
	if (!err.status)
		err = new InternalServerError(err.message);

	if (err.status < 500)
		logger.warn("%s [%d]: %s", err.name, err.status, err.message);
	else
		logger.error(err);

	res.status(err.status).json({
		error : {
			status: err.status,
			message: err.message
		}
	});
}

let notFoundHandler = (req, res, next) => {
	let err = new NotFound("The resource " + req.url + " was not found");
	logger.warn("%s [%d]: %s", err.name, err.status, err.message);
	res.status(err.status).json({
		error : {
			status: err.status,
			message: err.message
		}
	});
};

module.exports = { HTTPError, UserError, BadRequest, Unauthorized, Forbidden, NotFound, TooManyRequests, InternalServerError, NotImplemented, NotAvailable, errorHandler, notFoundHandler };
