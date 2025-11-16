const {
  validationResult, query, body, param,
} = require('express-validator');
const { MIN_GRADUATION_YEAR, MAX_PAGINATION_LIMIT } = require('../config/constants');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Validate application creation
const validateCreateApplication = [
  body('userId').optional().trim(),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('university').trim().notEmpty().withMessage('University is required'),
  body('major').trim().notEmpty().withMessage('Major is required'),
  body('graduationYear')
    .isInt({ min: MIN_GRADUATION_YEAR })
    .withMessage(`Graduation year must be ${MIN_GRADUATION_YEAR} or later`),
  body('committee').trim().notEmpty().withMessage('Committee is required'),
  body('resumeUrl').optional().trim().isURL()
    .withMessage('Resume URL must be a valid URL'),
  body('coverLetter').optional().trim(),
  body('responses').optional().isArray().withMessage('Responses must be an array'),
  body('responses.*.questionKey').trim().notEmpty().withMessage('Question key is required'),
  body('responses.*.question').trim().notEmpty().withMessage('Question text is required'),
  body('responses.*.answer').trim().notEmpty().withMessage('Answer is required'),
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
    .withMessage('Committee cannot be empty'),
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
