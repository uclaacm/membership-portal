const logger = require('../logger');

class HTTPError extends Error {
    constructor(status, message) {
        super(message);
        
        this.name = this.constructor.name;
        this.status = status;
        this.message = message;
    }
}

class BadRequest extends HTTPError {
    constructor(message) {
		message = message || "Bad Request";
        super(400, message);
    }
}

class Unauthorized extends HTTPError {
    constructor(message) {
		message = message || "Unauthorized request";
        super(401, message);
    }
}

class Forbidden extends HTTPError {
    constructor(message) {
		message = message || "Permission denied"; 
        super(403, message);
    }
}

class NotFound extends HTTPError {
    constructor(message) {
		message = message || "Resource not found";
        super(404, message);
    }
}

class TooManyRequests extends HTTPError {
    constructor(message) {
        super(429, message);
    }
}

class InternalServerError extends HTTPError {
    constructor(message) {
		message = message || "Internal server error";
        super(500, message);
    }
}

class NotImplemented extends HTTPError {
    constructor(message) {
		message = message || "Not Implemented";
        super(501, message);
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

module.exports = { BadRequest, Unauthorized, Forbidden, NotFound, TooManyRequests, InternalServerError, NotImplemented, NotAvailable, errorHandler, notFoundHandler };
