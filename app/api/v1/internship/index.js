const express = require('express');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Check user is authenticated
const auth = require('../auth').authenticated;
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require('./controllers/applicationController');
const { validateCreateApplication, validateUpdateApplication, validateGetApplications } = require('./middleware/validation');
const { strictCreateApplicationLimiter } = require('./middleware/rateLimiter');

const {
  getAllCommittees,
  getCommitteeById,
  createCommittees,
  updateCommittee,
  deleteCommittee,
} = require('./controllers/committeeController');

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


function isAdmin(req, res, next)  {
  if (!req.user || !req.user.isAdmin()) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}

// GET all committees
router.get('/committees', getAllCommittees);

// GET single committee by ID
router.get('/committees/:id', getCommitteeById);

// POST new committee
router.post('/committees', apiLimiter, isAdmin, createCommittees);

// PATCH a committee by ID, ADMIN only
router.patch('/committees/:id', isAdmin, updateCommittee);

// DELETE a committee by ID (soft delete, set isActive = false), ADMIN only
router.delete('/committees/:id', isAdmin, deleteCommittee);


module.exports = { router };
