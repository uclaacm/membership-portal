const express = require('express');
const db = require('../../db');
const log = require('../../logger');
let router = express.Router();

router.get('/', (req, res) => {
	db.Session.getAll().then(sessions => {
		res.json({ success: true, error: null, sessions: sessions.map(s => s.getPublic()) });
	}).catch(err => {
		log.error("[SESSIONS] Database error: %s", err);
		res.json({ success: false, error: err, sessions: [] });
	});
});

router.post('/attend', (req, res) => {
	if (!req.body || !req.body.session || !req.body.session.secret) 
		return res.json({ success: false, error: "Malformed reqest" });
	if (!req.user.teamId)
		return res.json({ success: false, error: "You must be in a team to record your attendance" });

	let date = new Date();
	db.Session.findSessionForDate(date).then(session => {
		if (!session)
			throw new Error("No ongoing session found. Make sure to login during the session");
		if (session.secret.toLowerCase() !== req.body.session.secret.toLowerCase())
			throw new Error("Wrong attendance code: " + req.body.session.secret);
		if (req.user.attendance.includes(session.number))
			throw new Error("You have already signed into this session");
		
		return db.Team.findById(req.user.teamId).then(team => {
			if (!team)
				throw new Error("Team not found for id '" + req.user.teamId + "'");
			
			req.user.attendance.push(session.number);
			req.user.save();
			team.addAttended(session.number, req.user.id);
			return team.save().then(() => {
				res.json({ success: true, error: null, sessionNumber: session.number });
			});
		});
	}).catch(err => {
		log.error("[ATTENDANCE] %s", err.message)
		res.json({ success: false, error: err.message });
	});
});

module.exports = { router };
