const express = require('express');
let router = express.Router();

const error = require('../../../error');
const Event = require('../../../db').Event;

router.route('/past')
.get((req, res, next) => {
	Event.getPastEvents().then(events => {
		res.json({ error: null, events: events.map(e => e.getPublic()) });
	}).catch(next);
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
})
.all((req, res, next) => {
	if (!req.isAdmin)
		return next(new error.Forbidden());
})
.post((req, res, next) => {
	if (req.params.uuid)
		return next(new error.BadRequest());
	return next(new error.NotImplemented());
})
.patch((req, res, next) => {
	if (!req.params.uuid)
		return next(new error.BadRequest());
	return next(new error.NotImplemented());
})
.delete((req, res, next) => {
	if (!req.params.uuid)
		return next(new error.BadRequest());
	return next(new error.NotImplemented());
})

module.exports = { router };
