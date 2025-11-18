const { body } = require('express-validator');
const { handleValidationErrors } = require('../../validation');

const validateCareerProfileUpdate = [
  body('user.bio')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .escape()
    .withMessage('Bio must be 1000 characters or less'),
  body('user.linkedinUrl')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('LinkedIn URL must be a valid URL'),
  body('user.githubUrl')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('GitHub URL must be a valid URL'),
  body('user.portfolioUrl')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Portfolio URL must be a valid URL'),
  body('user.personalWebsite')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Personal website must be a valid URL'),
  body('user.skills')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Skills must be an array with max 20 items'),
  body('user.skills.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape()
    .withMessage('Each skill must be 1-50 characters'),
  body('user.careerInterests')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Career interests must be an array with max 20 items'),
  body('user.careerInterests.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape()
    .withMessage('Each career interest must be 1-50 characters'),
  body('user.pronouns')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .escape()
    .withMessage('Pronouns must be 50 characters or less'),
  body('user.isProfilePublic')
    .optional()
    .isBoolean()
    .withMessage('isProfilePublic must be a boolean'),
  handleValidationErrors,
];

module.exports = {
  validateCareerProfileUpdate,
};
