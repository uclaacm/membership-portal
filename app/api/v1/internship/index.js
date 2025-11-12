const express = require('express');

const router = express.Router();

// Controller imports (implement these in your controllers directory)
const applicationController = require('./controllers/applicationController.ts');

// GET all applications
router.get('/applications', applicationController.getAllApplications);

// POST a new application
router.post('/applications', applicationController.createApplication);

// GET a single application by ID
router.get('/applications/:id', applicationController.getApplicationById);

// PUT (update) an application by ID
router.put('/applications/:id', applicationController.updateApplicationById);

// DELETE an application by ID
router.delete('/applications/:id', applicationController.deleteApplicationById);

module.exports = { router };
