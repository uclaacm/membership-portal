const express = require('express');
// Check user is authenticated
const auth = require('../auth').authenticated;
const admin = require('../auth').isAdmin;
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require('./controllers/applicationController');
const {
  getAllCommittees,
  getCommitteeById,
  createCommittees,
  updateCommittee,
  deleteCommittee,
} = require('./controllers/committeeController');
const { validateCreateApplication, validateUpdateApplication, validateGetApplications } = require('./middleware/validation');
const { strictCreateApplicationLimiter, committeeRateLimiter } = require('./middleware/rateLimiter');

const router = express.Router();

// GET all applications
router.get('/applications', validateGetApplications, getAllApplications);

// POST a new application
// Order matters! auth → rateLimit → validate → controller
router.post('/applications', auth, strictCreateApplicationLimiter, validateCreateApplication, createApplication);

// GET a single application by ID
router.get('/applications/:id', getApplicationById);

// PUT (update) an application by ID
router.put('/applications/:id', auth, validateUpdateApplication, updateApplication);

// DELETE an application by ID
router.delete('/applications/:id', auth, deleteApplication);

// GET all committees
router.get('/committees', getAllCommittees);

// GET a single committee by ID
router.get('/committees/:id', auth, getCommitteeById);

// CREATE committee (admin only)
router.post('/committees', auth, admin, committeeRateLimiter, createCommittees);

// UPDATE committee (admin only)
router.put('/committees/:id', auth, admin, committeeRateLimiter, updateCommittee);

// DELETE committee (admin only) - soft delete by setting isActive to false
router.delete('/committees/:id', auth, admin, deleteCommittee);

module.exports = { router };
