const express = require('express');
// Check user is authenticated
const auth = require('../auth').authenticated;
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require('./controllers/applicationController');
const { validateCreateApplication, validateUpdateApplication } = require('./middleware/validation');
const { strictCreateApplicationLimiter } = require('./middleware/rateLimiter');

const router = express.Router();

// GET all applications
router.get('/applications', getAllApplications);

// POST a new application
// Order matters! auth → rateLimit → validate → controller
router.post('/applications', auth, strictCreateApplicationLimiter, validateCreateApplication, createApplication);

// GET a single application by ID
router.get('/applications/:id', getApplicationById);

// PUT (update) an application by ID
router.put('/applications/:id', auth, validateUpdateApplication, updateApplication);

// DELETE an application by ID
router.delete('/applications/:id', auth, deleteApplication);

module.exports = { router };
