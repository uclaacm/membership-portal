const express = require('express');
let router = express.Router();

const log = require('../../../logger');
const error = require('../../../error');
const Event = require('../../../db').Event;

router.route('/past')
.get((req, res, next) => {
	Event.getPastEvents().then(events => {
		res.json({ error: null, events: events.map(e => e.getPublic()) });
	}).catch(next);
})
.post((req, res, next) => {
	if (!req.isAdmin)
		return next(new error.Forbidden());
	return next(new error.NotImplemented());
	// post request must be in req.body.event
	// validate and insert
});

router.route('/future')
.get((req, res, next) => {
	Event.getFutureEvents().then(events => {
		res.json({ error: null, events: events.map(e => e.getPublic()) });
	}).catch(next);
});

router.route('/:uuid')
.get((req, res, next) => {
	if (!req.params.uuid) {
		Event.findAll().then(events => {
			res.json({ error: null, events: events.map(e => e.getPublic()) });
		}).catch(next);
	} else {
		Event.findByUUID(req.params.uuid).then(event => {
			res.json({ error: null, event: event ? event.getPublic() : null });
		}).catch(next);
	}
});

module.exports = { router };
