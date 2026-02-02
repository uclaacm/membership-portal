const { query, body, param } = require('express-validator');
const { handleValidationErrors } = require('../../validation');
const { MIN_GRADUATION_YEAR, MAX_PAGINATION_LIMIT } = require('../config/constants');
const { Committee } = require('../models/Committee');

// Validate application creation
const validateCreateApplication = [
  body('userId').optional().trim(),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required')
    .custom((value) => {
      if (!value.endsWith('@ucla.edu')) {
        throw new Error('Email must be a @ucla.edu email address');
      }
      return true;
    }),
  body('phone').optional().trim(),
  body('university').trim().notEmpty().withMessage('University is required'),
  body('major').trim().notEmpty().withMessage('Major is required'),
  body('graduationYear')
    .isInt({ min: MIN_GRADUATION_YEAR })
    .withMessage(`Graduation year must be ${MIN_GRADUATION_YEAR} or later`),
  body('committee').trim().notEmpty().withMessage('Committee is required')
    .custom(async (value) => {
      // Check if committee exists and is active
      const committee = await Committee.findOne({ name: value });
      if (!committee) {
        throw new Error('Invalid committee selection');
      }
      if (!committee.isActive) {
        throw new Error('Selected committee is not currently accepting applications');
      }
      return true;
    }),
  body('resumeUrl').optional().trim().isURL()
    .withMessage('Resume URL must be a valid URL'),
  body('coverLetter').optional().trim(),
  body('responses').optional().isArray().withMessage('Responses must be an array'),
  body('responses.*.questionKey').trim().notEmpty().withMessage('Question key is required'),
  body('responses.*.question').trim().notEmpty().withMessage('Question text is required'),
  body('responses.*.answer').trim().notEmpty().withMessage('Answer is required'),
  // Custom validation to ensure all required questions are answered
  body().custom(async (value) => {
    const { committee, responses = [] } = value;
    // Find the committee with its custom questions
    const committeeDoc = await Committee.findOne({ name: committee });
    if (!committeeDoc) {
      throw new Error('Invalid committee');
    }
    // Get all required questions for this committee
    const requiredQuestions = committeeDoc.customQuestions.filter((q) => q.required);
    const answeredQuestionKeys = responses.map((r) => r.questionKey);
    // Check if all required questions are answered
    const missingQuestions = requiredQuestions.filter(
      (q) => !answeredQuestionKeys.includes(q.questionKey),
    );
    if (missingQuestions.length > 0) {
      const missing = missingQuestions.map((q) => q.questionText).join(', ');
      throw new Error(`Missing required questions: ${missing}`);
    }
    // Validate that all responses match valid questions
    const validQuestionKeys = committeeDoc.customQuestions.map((q) => q.questionKey);
    const invalidResponses = responses.filter(
      (r) => !validQuestionKeys.includes(r.questionKey),
    );
    if (invalidResponses.length > 0) {
      throw new Error('Responses contain invalid question keys');
    }
    // Check for duplicate questions
    const duplicates = answeredQuestionKeys.filter(
      (key, index) => answeredQuestionKeys.indexOf(key) !== index,
    );
    if (duplicates.length > 0) {
      throw new Error('Duplicate responses detected');
    }
    return true;
  }),
  handleValidationErrors,
];

// Validate application update
const validateUpdateApplication = [
  param('id').isMongoId().withMessage('Invalid application ID'),
  body('userId').optional().trim(),
  body('firstName').optional().trim().notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty()
    .withMessage('Last name cannot be empty'),
  body('email').optional().trim().isEmail()
    .withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('university').optional().trim().notEmpty()
    .withMessage('University cannot be empty'),
  body('major').optional().trim().notEmpty()
    .withMessage('Major cannot be empty'),
  body('graduationYear')
    .optional()
    .isInt({ min: MIN_GRADUATION_YEAR })
    .withMessage(`Graduation year must be ${MIN_GRADUATION_YEAR} or later`),
  body('committee').optional().trim().notEmpty()
    .withMessage('Committee cannot be empty')
    .custom(async (value) => {
      if (value) {
        const committee = await Committee.findOne({ name: value });
        if (!committee) {
          throw new Error('Invalid committee selection');
        }
        if (!committee.isActive) {
          throw new Error('Selected committee is not currently accepting applications');
        }
      }
      return true;
    }),
  body('resumeUrl').optional().trim().isURL()
    .withMessage('Resume URL must be a valid URL'),
  body('coverLetter').optional().trim(),
  body('responses').optional().isArray().withMessage('Responses must be an array'),
  body('responses.*.questionKey').optional().trim().notEmpty()
    .withMessage('Question key is required'),
  body('responses.*.question').optional().trim().notEmpty()
    .withMessage('Question text is required'),
  body('responses.*.answer').optional().trim().notEmpty()
    .withMessage('Answer is required'),
  body('status')
    .optional()
    .isIn(['pending', 'reviewing', 'accepted', 'rejected'])
    .withMessage('Invalid status'),
  handleValidationErrors,
];

// Validate get all applications query
const validateGetApplications = [
  query('status')
    .optional()
    .isIn(['pending', 'reviewing', 'accepted', 'rejected'])
    .withMessage('Invalid status filter'),
  query('committee').optional().trim(),
  query('userId').optional().trim(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: MAX_PAGINATION_LIMIT })
    .withMessage(`Limit must be between 1 and ${MAX_PAGINATION_LIMIT}`),
  handleValidationErrors,
];

// Validate MongoDB ID
const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateCreateApplication,
  validateUpdateApplication,
  validateGetApplications,
  validateMongoId,
};
