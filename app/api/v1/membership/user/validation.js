const { body } = require('express-validator');
const { handleValidationErrors } = require('../../validation');

const validateCareerProfileUpdate = [
  body('user')
    .isObject()
    .withMessage('Request body must contain a user object'),
  body('user.linkedinUrl')
    .optional()
    .isURL({ protocols: ['http', 'https'], host_whitelist: ['linkedin.com', 'www.linkedin.com'] })
    .withMessage('LinkedIn URL must be a valid URL'),
  body('user.githubUrl')
    .optional()
    .isURL({ protocols: ['http', 'https'], host_whitelist: ['github.com', 'www.github.com'] })
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
  handleValidationErrors,
];

const validateUserProfileUpdate = [
  body('user')
    .isObject()
    .withMessage('Request body must contain a user object'),
  body('user.firstName')
    .optional()
    .isString()
    .trim()
    .withMessage('First name must be a string'),
  body('user.lastName')
    .optional()
    .isString()
    .trim()
    .withMessage('Last name must be a string'),
  body('user.major')
    .optional()
    .isString()
    .trim()
    .withMessage('Major must be a string'),
  body('user.year')
    .optional()
    .isInt({ min: 1, max: 5 })
    .toInt()
    .withMessage('Year must be an integer between 1 and 5'),
  body('user.bio')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .escape()
    .withMessage('Bio must be 1000 characters or less'),
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
  validateUserProfileUpdate,
};
