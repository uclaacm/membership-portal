const express = require('express');
let router = express.Router();

const app = require('../../..');
const Event = app.db.Event;

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
	if (!req.user.isAdmin())
		return next(new app.error.Forbidden());
})
.post((req, res, next) => {
	if (req.params.uuid)
		return next(new app.error.BadRequest());
	return next(new app.error.NotImplemented());
})
.patch((req, res, next) => {
	if (!req.params.uuid)
		return next(new app.error.BadRequest());
	return next(new app.error.NotImplemented());
})
.delete((req, res, next) => {
	if (!req.params.uuid)
		return next(new app.error.BadRequest());
	return next(new app.error.NotImplemented());
})

module.exports = { router };
