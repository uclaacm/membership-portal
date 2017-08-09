const express = require('express');
let router = express.Router();

const error = require('../../../error');
const Event = require('../../../db').Event;

router.route('/past')
.get((req, res, next) => {
	let offset = parseInt(req.query.offset);
	let limit = parseInt(req.query.limit);
	Event.getPastEvents(offset, limit).then(events => {
		res.json({ error: null, events: events.map(e => e.getPublic()) });
	}).catch(next);
});

router.route('/future')
.get((req, res, next) => {
	let offset = parseInt(req.query.offset);
	let limit = parseInt(req.query.limit);
	Event.getFutureEvents(offset, limit).then(events => {
		res.json({ error: null, events: events.map(e => e.getPublic()) });
	}).catch(next);
});

router.route('/:uuid?')
.get((req, res, next) => {
	if (!req.params.uuid || !req.params.uuid.trim()) {
		let offset = parseInt(req.query.offset);
		let limit = parseInt(req.query.limit);
		Event.getAll(offset, limit).then(events => {
			res.json({ error: null, events: events.map(e => e.getPublic(req.user.isAdmin())) });
		}).catch(next);
	} else {
		Event.findByUUID(req.params.uuid).then(event => {
			res.json({ error: null, event: event ? event.getPublic(req.user.isAdmin()) : null });
		}).catch(next);
	}
})
.all((req, res, next) => {
	if (!req.user.isAdmin())
		return next(new error.Forbidden());
	return next();
})
.post((req, res, next) => {
	if (req.params.uuid || !req.body.event)
		return next(new error.BadRequest());

	if (req.body.event.startDate && req.body.event.endDate && new Date(req.body.event.startDate) > new Date(req.body.event.endDate))
		return next(new error.BadRequest("Start date must be before end date"));

	Event.create(Event.sanitize(req.body.event)).then(event => {
		res.json({ error: null, event: event.getPublic() });
	}).catch(next);
})
.patch((req, res, next) => {
	if (!req.params.uuid || !req.params.uuid.trim() || !req.body.event)
		return next(new error.BadRequest());

	if (req.body.event.startDate && req.body.event.endDate && new Date(req.body.event.startDate) > new Date(req.body.event.endDate))
		return next(new error.BadRequest("Start date must be before end date"));

	Event.findByUUID(req.params.uuid).then(event => {
		if (!event)
			throw new error.BadRequest('No such event found');
		return event.update(Event.sanitize(req.body.event));
	}).then(event => {
		res.json({ error: null, event: event.getPublic() });
	}).catch(next);
})
.delete((req, res, next) => {
	if (!req.params.uuid)
		return next(new error.BadRequest());
	Event.destroyByUUID(req.params.uuid).then(numDeleted => {
		res.json({ error: null, numDeleted: numDeleted });
	}).catch(next);
})

module.exports = { router };
