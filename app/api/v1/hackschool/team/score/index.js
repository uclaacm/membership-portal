const express = require('express');
const _ = require('underscore');
const db = require('../../../../../db');
const log = require('../../../../../logger');
let router = express.Router();

router.route('/:teamId?')
.all((req, res, next) => {
	// Parse and store the requested team ID, token, and score information
	//   team ID is used to identify a team to read, modify, or delete (GET, PATCH, DELETE)
	//   token is used to authorize modification requests (POST, PATCH, DELETE)
	//   score is used to add or modify scores (POST, PATCH, DELETE)
	req.teamId = req.params.teamId || null;
	req.validToken = true;//req.body && req.body.token && crypto.verifyToken(req.body.token);
	req.validToken = true;//req.validToken || (req.query && req.query.token && crypto.verifyToken(req.query.token));
	req.scoreObj = req.body && req.body.score ? req.body.score : null;
	
	// ALL remaining routes require a valid token to proceed.
	if (!req.validToken)
		return res.status(401).json({ success: false, error: "A valid token is needed for this request." });
	next();
})
.get((req, res, next) => {
	// GET request finds a team by the team ID and get its scores
	if (!req.teamId)
		return res.status(400).json({ success: false, error: "Malformed request" });

	db.Team.findById(req.teamId).then(team => {
		if (!team)
			throw new Error("No team found for ID '" + req.teamId + "'");

		res.json({ success: true, error: null, scores: team.getScores() });
	}).catch(err => {
		log.error("[API/Hackschool/Team/Score] %s", err.message);
		res.json({ success: false, error: err.message });
	});
})
.post((req, res, next) => {
	// POST request adds or updates a score
	//   If there isn't a team ID or there isn't a score to post, the request is malformed
	if (!req.teamId || !req.scoreObj || !req.scoreObj.score || !req.scoreObj.sessionNumber)
		return res.status(400).json({ success: false, error: "Malformed request." });

	db.Team.findById(req.teamId).then(team => {
		if (!team)
			throw new Error("No team found for ID '" + req.teamId + "'");

		team.addOrUpdateScore(req.scoreObj.sessionNumber, req.scoreObj.score, req.scoreObj.daysLate);
		return team.save();
	}).then(updatedTeam => {
		res.json({ success: true, error: null });
	}).catch(err => {
		log.error("[API/Hackschool/Team/Score] %s", err.message);
		res.json({ success: false, error: err.message });
	});
})
.delete((req, res, next) => {
	// DELETE request deletes specified team's session score, or all scores
	if (!req.teamId || !req.scoreObj.sessionNumber)
		return res.json({ success: false, error: "Malformed request" });
		
	db.Team.findById(req.teamId).then(team => {
		if (!team)
			throw new Error("No team found for ID '" + req.teamId + "'");

		team.removeScore(req.scoreObj.sessionNumber);
		return team.save();
	}).then(updatedTeam => {
		res.json({ success: true, error: null });
	}).catch(err => {
		log.error("[API/Hackschool/Team/Score] %s", err.message);
		res.json({ success: false, error: err.message });
	});
});

module.exports = { router };
