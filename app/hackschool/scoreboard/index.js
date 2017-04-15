const express = require('express');
const db = require('../../db');
const log = require('../../logger');
const cache = require('../../cache');
const config = require('../../config');
let router = express.Router();

let generateScoreboard = () => {
	return db.Team.getAll().then(teams => {
		teams = teams.map(team => team.getPublic());

		if (teams.length > 0) {
			teams.sort((a, b) => {
				if (a.totalScore > b.totalScore) return -1;
				if (a.totalScore < b.totalScore) return 1;
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			});
	

			teams[0].rank = 1;
			for (let i = 1; i < teams.length; i++) {
				if (teams[i].totalScore === teams[i - 1].totalScore)
					teams[i].rank = teams[i - 1].rank
				else
					teams[i].rank = i + 1;
			}
		}
	
		return teams;
	});
};

router.get('/', (req, res) => {
	cache.get(config.cache.keys.teamsNeedUpdate).then(value => {
		if (value === "0") {
			log.debug("[SCOREBOARD] using cached teams");
			return cache.get(config.cache.keys.scoreboardTeams).then(teams => JSON.parse(teams));
		} else {
			log.debug("[SCOREBOARD] generating scoreboard");
			cache.set(config.cache.keys.teamsNeedUpdate, "0");
			return generateScoreboard().then(teams => {
				cache.set(config.cache.keys.scoreboardTeams, JSON.stringify(teams));
				return teams;
			});
		}
	}).then(teams => {
		res.json({ success: true, error: null, scoreboard: teams });
	}).catch(err => {
		log.error("[SCOREBOARD] %s", err.message);
		res.status(500).json({ success: false, error: null, scoreboard: [] });
	});
});

module.exports = { router };
