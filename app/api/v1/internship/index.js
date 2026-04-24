const express = require('express');
// Check user is authenticated
const auth = require('../auth').authenticated;
const admin = require('../auth').isAdmin;
const officer = require('../auth').isOfficer;
const adminOrOfficer = require('../auth').isOfficerOrAdmin;

const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getOwnApplication,
} = require('./controllers/applicationController');
const {
  getAllCommittees,
  getAllCommitteesAdmin,
  getCommitteeById,
  createCommittees,
  updateCommittee,
  deleteCommittee,
} = require('./controllers/committeeController');
const { validateCreateApplication, validateUpdateApplication, validateGetApplications } = require('./middleware/validation');
const { strictCreateApplicationLimiter, getApplicationsLimiter, committeeRateLimiter } = require('./middleware/rateLimiter');

const router = express.Router();

// GET all applications (officers and admins only)
router.get('/applications', auth, adminOrOfficer, getApplicationsLimiter, validateGetApplications, getAllApplications);

// GET own application (authenticated non-admin user)
router.get('/applications/me', auth, getApplicationsLimiter, getOwnApplication);

// GET a single application by ID (officers only)
router.get('/applications/:id', auth, officer, getApplicationsLimiter, getApplicationById);

// POST a new application
// Order matters! auth → rateLimit → validate → controller
router.post('/applications', auth, strictCreateApplicationLimiter, validateCreateApplication, createApplication);

// PUT (update) an application by ID
router.put('/applications/:id', auth, validateUpdateApplication, updateApplication);

// DELETE an application by ID
router.delete('/applications/:id', auth, deleteApplication);

// GET all committees
router.get('/committees', getAllCommittees);

// GET all committees including inactive (admin only) - must be before /:id
router.get('/committees/admin', auth, admin, getAllCommitteesAdmin);

// GET a single committee by ID
router.get('/committees/:id', auth, getCommitteeById);

// CREATE committee (admin only)
router.post('/committees', auth, admin, committeeRateLimiter, createCommittees);

// UPDATE committee
router.put('/committees/:id', auth, adminOrOfficer, committeeRateLimiter, updateCommittee);

// DELETE committee (admin only) - soft delete by setting isActive to false
router.delete('/committees/:id', auth, admin, deleteCommittee);

module.exports = { router };
