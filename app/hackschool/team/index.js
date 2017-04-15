const express = require('express');
const async = require('async');
const util = require('util');
const db = require('../../db');
const log = require('../../logger');
let router = express.Router();

router.get('/', (req, res) => {
	if (!req.user.teamId)
		return res.json({ success: true, error: null, team: null });

	db.Team.findById(req.user.teamId).then(team => {
		if (!team)
			throw new Error("Could not find team for id '" + req.user.teamId + "'");
		res.json({ success: true, error: null, team: team.getPublic() });
	}).catch(err => {
		log.error("[TEAMS] %s", err.message);
		res.json({ success: false, error: err.message });
	});
});

router.post('/create', (req, res) => {
	if (req.user.teamId && req.user.teamId !== "")
		return res.json({ success: false, error: "You are already in a team." });
	if (!req.body.team || !req.body.team.name)
		return res.json({ success: false, error: "Malformed request." });
	if (!req.body.team.name.length)
		return res.json({ success: false, error: "Invalid team name." });
	
	db.Team.findByName(req.body.team.name).then(team => {
		if (team)
			throw new Error("A team with name '" + req.body.team.name + "' already exists");
		let newTeam = new db.Team({ name: req.body.team.name });
		req.user.teamId = newTeam.id;
		newTeam.addUser(req.user);
		return newTeam.save();
	}).then(team => {
		req.user.save();
		res.json({ success: true, error: null, team: team.getPublic() });
		return null;
	}).catch(err => {
		log.error("[TEAMS] %s", err.message);
		res.json({ success: false, error: err.message });
	});;
});

router.get('/leave', (req, res) => {
	if (!req.user.teamId)
		return res.json({ success: false, error: "You are not in a team." });

	db.Team.findById(req.user.teamId).then(team => {
		if (!team)
			throw new Error("Could not find team for id '" + req.user.teamId + "'");
		team.removeUser(req.user);
		return (team.members.length === 0 ? team.remove : team.save)();
	}).then((arg) => {
		req.user.teamId = "";
		req.user.save();
		res.json({ success: true, error: null });
		return null;
	}).catch(err => {
		log.error("[TEAMS] %s", err.stack);
		log.error("[TEAMS] %s", err.message);
		res.json({ success: false, error: err.message });
	});
});

router.post('/join', (req, res) => {
	if (req.user.teamId)
		return res.json({ success: false, error: "You are already in a team." });
	if (!req.body.team || !req.body.team.id)
		return res.json({ success: false, error: "Malformed request." });

	db.Team.findById(req.body.team.id).then(team => {
		if (!team)
			throw new Error("Could not find team for id '" + req.body.team.id + "'");
		if (team.members.length >= 4)
			throw new Error("This team already has the maximum number of team members");
		req.user.teamId = team.id
		req.user.save();
		team.addUser(req.user);
		return team.save();
	}).then(team => {
		res.json({ success: true, error: null, team: team.getPublic() });
	}).catch(err => {
		log.error("[TEAMS] %s", err.message);
		res.json({ success: false, error: err.message });
	});
});

module.exports = { router };
