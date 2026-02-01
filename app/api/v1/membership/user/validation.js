const { body, query, param } = require('express-validator');
const rateLimit = require('express-rate-limit');
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

const validatePublicProfileLookup = [
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message: 'Too many profile requests from this IP, please try again later.',
  }),
  query('fields')
    .optional()
    .isString(),
  param('uuid')
    .isUUID(4),
];

const validateDirectoryLookup = [
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 50,
    message: 'Too many directory requests from this IP, please try again later.',
  }),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Page must be an integer greater than 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Limit must be an integer between 1 and 100'),
  query('skills')
    .optional()
    .isString(),
  query('careerInterests')
    .optional()
    .isString(),
  handleValidationErrors,
];

module.exports = {
  validateCareerProfileUpdate,
  validatePublicProfileLookup,
  validateDirectoryLookup,
  validateUserProfileUpdate,
};
