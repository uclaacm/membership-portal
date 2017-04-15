const express = require('express');
const _ = require('underscore');
const db = require('../../../db');
const log = require('../../../logger');
let router = express.Router();

router.route('/:eventId?')
.all((req, res, next) => {
	// Parse and store the requested event ID, token, and event information
	//   event ID is used to identify an event to read, modify, or delete (GET, PATCH, DELETE)
	//   token is used to authorize modification requests (POST, PATCH, DELETE)
	//   event is used to add or modify events (POST, PATCH)
	req.eventId = req.params.eventId || null;
	req.validToken = true; // this used to be actually evaluated, pre-fork 
	req.event = req.body && req.body.event
	                     && typeof req.body.event === "object" ?
						     db.Event.sanitize(req.body.event, withId=false) : null;
	next();
})
.get((req, res, next) => {
	// GET request finds an event by the event ID, if given, otherwise get all events
	let dbQuery = req.eventId ? { id: req.eventId } : {};

	db.Event.find(dbQuery).exec().then(events => {
		res.json({ success: true, error: null, numResults: events.length || 0, events: events.map(e => e.getPublic()) }); 
	}).catch(err => {
		log.error("[API/Events] %s", err.message);
		res.json({ success: false, error: err.message });
	});
})
.all((req, res, next) => {
	// ALL remaining routes require a valid token to proceed.
	if (!req.validToken)
		return res.status(401).json({ success: false, error: "A valid token is needed for this request."});
	next();
})
.post((req, res, next) => {
	// POST request adds and event
	//   If there is an event ID or there isn't an event to post, the request is malformed
	if (req.eventId || !req.event)
		return res.status(400).json({ success: false, error: "Malformed request." }); 

	// Create a new event with the given details (sanitized in .all)
	let newEvent = new db.Event(req.event);
	newEvent.save().then(updatedEvent => {
		res.json({ success: true, error: null, event: updatedEvent.getPublic() });
	}).catch(err => {
		log.error("[API/Events] %s", err.message);
		res.json({ success: false, error: err.message });
	});
})
.patch((req, res, next) => {
	// PATCH request updates an existing event
	//   If there isn't an event ID or there isn't a field description of what to update,
	//   then the request is malformed
	if (!req.eventId || !req.event)
		return res.status(400).json({ success: false, error: "Malformed request." }); 

	// Find the event by ID and update the field based on the given details (sanitized in .all)
	db.Event.findById(req.eventId).then(event => {
		if (!event)
			throw new Error("Unable to find event for ID '" + req.eventId + "'");
		event.update(req.event);
		return event.save();
	}).then(updatedEvent => {
		res.json({ success: true, error: null, event: updatedEvent.getPublic() });		
	}).catch(err => {
		log.error("[API/Events] %s", err.message);
		res.json({ success: false, error: err.message });
	});
})
.delete((req, res, next) => {
	// DELETE request deletes the indicated event (or all events, if none specified)
	let dbQuery = req.eventId ? { id: req.eventId } : {};
	db.Event.remove(dbQuery).exec().then(opInfo => {
		res.json({ success: true, error: null, removed: opInfo.result.n || 0 }); 
	}).catch(err => {
		log.error("[API/Events] %s", err.message);
		res.json({ success: false, error: err.message, removed: 0 });
	});
});

module.exports = { router };
