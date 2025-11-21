const express = require('express');
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require('./controllers/applicationController');

const {
  validateCreateApplication,
  validateUpdateApplication,
  validateGetApplications,
  validateMongoId,
} = require('./middleware/validation');

const router = express.Router();

// GET all applications
router.get(
  '/applications',
  validateGetApplications,
  getAllApplications,
);

// POST a new application
router.post(
  '/applications',
  validateCreateApplication,
  createApplication,
);

// GET a single application by ID
router.get(
  '/applications/:id',
  validateMongoId,
  validateGetApplications,
  getApplicationById,
);

// PUT (update) an application by ID
router.put(
  '/applications/:id',
  validateMongoId,
  validateUpdateApplication,
  updateApplication,
);

// DELETE an application by ID
router.delete(
  '/applications/:id',
  validateMongoId,
  deleteApplication,
);

module.exports = { router };
