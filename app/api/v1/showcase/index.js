const express = require('express');
const _ = require('underscore');
const db = require('../../../db');
const log = require('../../../logger');
let router = express.Router();

router.route('/:projectId?')
.all((req, res, next) => {
	// Parse and store the requested project ID, token, and project information
	//   project ID is used to identify a project to read, modify, or delete (GET, PATCH, DELETE)
	//   token is used to authorize modification requests (POST, PATCH, DELETE)
	//   project is used to add or modify projects (POST, PATCH)
	req.projectId = req.params.projectId || null;
	req.validToken = true; // this used to be actually evaluated pre-fork 
	req.project = req.body && req.body.project
	                     && typeof req.body.project === "object" ?
						     db.ShowcaseProject.sanitize(req.body.project, withId=false) : null;
	next();
})
.get((req, res, next) => {
	// GET request finds a project by the project ID, if given, otherwise get all projects
	let dbQuery = req.projectId ? { id: req.projectId } : {};

	db.ShowcaseProject.find(dbQuery).exec().then(projects => {
		res.json({ success: true, error: null, numResults: projects.length || 0, projects: projects.map(p => p.getPublic()) });
	}).catch(err => {
		log.error("[API/Showcase] %s", err.message);
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
	// POST request adds a project
	//   If there is a project ID or there isn't a project to post, the request is malformed
	if (req.projectId || !req.project)
		return res.status(400).json({ success: false, error: "Malformed request."});

	// Create a new project with the given details (sanitized in .all)
	let newShowcaseProject = new db.ShowcaseProject(req.project);
	newShowcaseProject.save().then(updatedProject => {
		res.json({ success: true, error: null, project: updatedProject.getPublic() });
	}).catch(err => {
		log.error("[API/Showcase] %s", err.message);
		res.json({ success: false, error: err.message });
	});
})
.patch((req, res, next) => {
	// PATCH request updates an existing project
	//   If there isn't a project ID or there isn't a field description of what to update,
	//   then the request is malformed
	if (!req.projectId || !req.project)
		return res.status(400).json({ success: false, error: "Malformed request." });

	// Find the project by ID and update the field based on the given details (sanitized above)
	db.ShowcaseProject.findById(req.projectId).then(project => {
		if (!project)
			throw new Error("Could not find project for ID '" + req.projectId + "'");
		project.update(req.project);
		return project.save();
	}).then(updatedProject => {
		res.json({ success: true, error: null, project: updatedProject.getPublic() });
	}).catch(err => {
		log.error("[API/Showcase] %s", err.message);
		res.json({ success: false, error: err.message });
	});
})
.delete((req, res, next) => {
	// DELETE request deletes the indicated project (or all projects, if none specified)
	let dbQuery = req.projectId ? { id: req.projectId } : {};

	db.ShowcaseProject.remove(dbQuery).exec().then(opInfo => {
		res.json({ success: true, error: null, removed: opInfo.result.n || 0 }); 
	}).catch(err => {
		log.error("[API/Showcase] %s", err.message);
		res.json({ success: false, error: err.message, removed: 0 });
	});
});

module.exports = { router };
