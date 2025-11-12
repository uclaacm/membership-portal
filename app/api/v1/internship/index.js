const express = require('express');
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require('./controllers/applicationController');

const router = express.Router();

// GET all applications
router.get('/applications', getAllApplications);

// POST a new application
router.post('/applications', createApplication);

// GET a single application by ID
router.get('/applications/:id', getApplicationById);

// PUT (update) an application by ID
router.put('/applications/:id', updateApplication);

// DELETE an application by ID
router.delete('/applications/:id', deleteApplication);

module.exports = { router };
