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
  updateApplicationStatus,
  deleteApplication,
  getOwnApplication,
  submitApplication,
} = require('./controllers/applicationController');
const {
  getAllCommittees,
  getAllCommitteesAdmin,
  getCommitteeById,
  createCommittees,
  updateCommitteeQuestions,
  updateCommitteeAdmin,
  deleteCommittee,
} = require('./controllers/committeeController');
const {
  validateCreateApplication,
  validateUpdateApplication,
  validateUpdateApplicationStatus,
  validateGetApplications,
  validateMongoId,
} = require('./middleware/validation');
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

// PUT update review status for one committee choice (officers/admins only)
router.put('/applications/:id/status', auth, adminOrOfficer, validateUpdateApplicationStatus, updateApplicationStatus);

// POST submit a draft application (member+)
router.post('/applications/:id/submit', auth, strictCreateApplicationLimiter, validateMongoId, submitApplication);

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

// UPDATE committee (admin only)
router.put('/committees/:id/admin', auth, admin, committeeRateLimiter, updateCommitteeAdmin);

// UPDATE committee (admin or officer)
// Only allows updating committee questions
router.put('/committees/:id/questions', auth, adminOrOfficer, committeeRateLimiter, updateCommitteeQuestions);

// DELETE committee (admin only) - soft delete by setting isActive to false
router.delete('/committees/:id', auth, admin, deleteCommittee);

module.exports = { router };
