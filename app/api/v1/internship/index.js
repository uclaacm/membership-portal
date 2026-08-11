const express = require('express');
// Check user is authenticated
const auth = require('../auth').authenticated;
const admin = require('../auth').isAdmin;
const officer = require('../auth').isOfficer;
const adminOrOfficer = require('../auth').isOfficerOrAdmin;

const {
  createApplication,
  getAllApplications,
  getApplicationStatusCounts,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  updateApplicationReview,
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
  archiveCommittee,
  bulkUpdateCommitteeStatus,
} = require('./controllers/committeeController');
const { getCycleInfo, advanceCycle } = require('./controllers/cycleController');
const {
  validateCreateApplication,
  validateUpdateApplication,
  validateUpdateApplicationStatus,
  validateUpdateApplicationReview,
  validateGetApplications,
  validateMongoId,
} = require('./middleware/validation');
const { strictCreateApplicationLimiter, getApplicationsLimiter, committeeRateLimiter } = require('./middleware/rateLimiter');

const router = express.Router();

// GET all applications (officers and admins only)
router.get('/applications', auth, adminOrOfficer, getApplicationsLimiter, validateGetApplications, getAllApplications);

// GET own application (authenticated non-admin user)
router.get('/applications/me', auth, getApplicationsLimiter, getOwnApplication);

// GET per-status application counts for a committee (officers and admins) - must be before /:id
router.get('/applications/status-counts', auth, adminOrOfficer, getApplicationsLimiter, getApplicationStatusCounts);

// GET a single application by ID (officers only)
router.get('/applications/:id', auth, officer, getApplicationsLimiter, getApplicationById);

// POST a new application
// Order matters! auth → rateLimit → validate → controller
router.post('/applications', auth, strictCreateApplicationLimiter, validateCreateApplication, createApplication);

// PUT (update) an application by ID
router.put('/applications/:id', auth, validateUpdateApplication, updateApplication);

// PUT update review status for one committee choice (officers/admins only)
router.put('/applications/:id/status', auth, adminOrOfficer, validateUpdateApplicationStatus, updateApplicationStatus);

// PUT update an officer review field (yes/no rating or notes) for one committee choice
router.put('/applications/:id/review', auth, adminOrOfficer, validateUpdateApplicationReview, updateApplicationReview);

// POST submit a draft application (member+)
router.post('/applications/:id/submit', auth, strictCreateApplicationLimiter, validateMongoId, submitApplication);

// DELETE an application by ID
router.delete('/applications/:id', auth, deleteApplication);

// GET all committees
router.get('/committees', getAllCommittees);

// GET all committees including inactive (admin only) - must be before /:id
router.get('/committees/admin', auth, admin, getAllCommitteesAdmin);

// PATCH bulk open/close committees (admin only) - must be before /:id routes
router.patch('/committees/bulk-status', auth, admin, committeeRateLimiter, bulkUpdateCommitteeStatus);

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

// ARCHIVE a committee's current-cycle applications (admin only)
router.post('/committees/:id/archive', auth, admin, committeeRateLimiter, archiveCommittee);

// GET the current/past application cycle info (admin only)
router.get('/cycle', auth, admin, getCycleInfo);

// POST advance to a new application cycle, archiving the outgoing cycle (admin only)
router.post('/cycle/advance', auth, admin, committeeRateLimiter, advanceCycle);

module.exports = { router };
