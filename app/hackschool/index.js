const express = require('express');
let router = express.Router();

// Double-check authentication
router.use((req, res, next) => {
	if (!req.user || !req.user.id) {
		log.info("Unauthorized access at %s, from %s %s", new Date(), req.ip, req.headers['user-agent']);
		return res.status(401).json({ success: false, error: "Unauthorized" });
	}

	if (req.user && req.user.status === 'BLOCKED') {
		log.info("Blocked user id '%s' tried to access %s at %s, from %s %s", req.user.id, req.baseUrl, req.ip, req.headers['user-agent']);
		return res.status(403).json({ success: false, error: "Blocked" });
	}
	
	next();
});

// Route hack school components
router.use('/user', require('./user').router);
router.use('/team', require('./team').router);
router.use('/sessions', require('./sessions').router);
router.use('/scoreboard', require('./scoreboard').router);

// Render the dashboard
router.get('/', (req, res) => {
	res.render('hackschool/dashboard');
});

module.exports = { router };
