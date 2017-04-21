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

router.route('/:uuid?')
.get((req, res, next) => {
	if (!req.params.uuid || !req.params.uuid.trim()) {
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
	if (!req.user.isAdmin())
		return next(new error.Forbidden());
})
.post((req, res, next) => {
	if (req.params.uuid || !req.body.event)
		return next(new error.BadRequest());
	
	Event.create(Event.sanitize(req.body.event)).then(event => {
		res.json({ error: null, event: event.getPublic() });
	}).catch(next);
})
.patch((req, res, next) => {
	if (!req.params.uuid || !req.params.uuid.trim() || !req.body.event)
		return next(new error.BadRequest());
	Event.findByUUID(req.params.uuid).then(event => {
		if (!event)
			throw new error.BadRequest('No such event found');
		return event.update(Event.sanitize(req.body.event));
	}).then(event => {
		res.json({ error: null, event: event.getPublic() });
	}).next();
})
.delete((req, res, next) => {
	if (!req.params.uuid)
		return next(new error.BadRequest());
	Event.destroyByUUID(req.params.uuid).then(numDeleted => {
		res.json({ error: null, numDeleted: numDeleted });
	}).catch(next);
})

module.exports = { router };
