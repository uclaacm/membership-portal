const { query, body, param } = require('express-validator');
const { handleValidationErrors } = require('../../validation');
const { MIN_GRADUATION_YEAR, MAX_PAGINATION_LIMIT } = require('../config/constants');
const { Committee } = require('../models/Committee');

const STATUS_OPTIONS = [
  'pending',
  'reviewing',
  'interview_scheduled',
  'accepted',
  'rejected',
];

const STATUS_FIELD_OPTIONS = [
  'firstChoiceStatus',
  'secondChoiceStatus',
  'thirdChoiceStatus',
];

const REVIEW_FIELD_OPTIONS = [
  'firstChoiceOfficer1Rating',
  'secondChoiceOfficer1Rating',
  'thirdChoiceOfficer1Rating',
  'firstChoiceOfficer2Rating',
  'secondChoiceOfficer2Rating',
  'thirdChoiceOfficer2Rating',
  'firstChoiceNotes',
  'secondChoiceNotes',
  'thirdChoiceNotes',
];

const RATING_OPTIONS = ['yes', 'no', 'maybe'];
const NOTES_MAX_LENGTH = 2000;

const EMAIL_REGEX = /^\S+@(ucla\.edu|g\.ucla\.edu)$/;

async function validateCommitteeById(value, fieldLabel) {
  if (!value) {
    return true;
  }
  const committee = await Committee.findById(value);
  if (!committee) {
    throw new Error(`Invalid ${fieldLabel} committee selection`);
  }
  if (!committee.isActive) {
    throw new Error(`${fieldLabel} committee is not currently accepting applications`);
  }
  return true;
}

function getDuplicateValues(values) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

async function validateCommitteeResponses(committeeId, responses, fieldLabel) {
  if (!committeeId) {
    if (responses && responses.length > 0) {
      throw new Error(`${fieldLabel} responses require a committee selection`);
    }
    return true;
  }

  const committee = await Committee.findById(committeeId);
  if (!committee) {
    throw new Error(`Invalid ${fieldLabel} committee selection`);
  }

  const responseList = Array.isArray(responses) ? responses : [];
  const answeredQuestionKeys = responseList.map((r) => r.questionKey);

  // Required-question completeness is enforced at submission time (see
  // submitApplication in applicationController.js), not at draft creation —
  // Step 1 of the wizard creates the draft from just a committee choice,
  // before the user has answered any custom questions in Step 2.

  const validQuestionMap = new Map(
    committee.customQuestions.map((q) => [q.questionKey, q]),
  );
  const invalidResponses = responseList.filter(
    (r) => !validQuestionMap.has(r.questionKey),
  );
  if (invalidResponses.length > 0) {
    throw new Error(`${fieldLabel} responses contain invalid question keys`);
  }

  const duplicateKeys = getDuplicateValues(answeredQuestionKeys);
  if (duplicateKeys.length > 0) {
    throw new Error(`Duplicate responses detected for ${fieldLabel} committee`);
  }

  const invalidChoices = responseList.filter((r) => {
    const question = validQuestionMap.get(r.questionKey);
    if (!question || question.questionType !== 'multiple_choice') {
      return false;
    }
    if (!Array.isArray(question.choices) || question.choices.length === 0) {
      return false;
    }
    return !question.choices.includes(r.answer);
  });
  if (invalidChoices.length > 0) {
    throw new Error(`${fieldLabel} responses include invalid choices`);
  }

  return true;
}

// Validate application creation
const validateCreateApplication = [
// Rejects apps with fields that have .not() bc they should be autopopulated, prevents spoofing
  body('userId').not().exists().withMessage('userId will be set automatically from your account'),
  body('firstName').not().exists().withMessage('firstName will be set automatically from your account'),
  body('lastName').not().exists().withMessage('lastName will be set automatically from your account'),
  body('email').not().exists().withMessage('email will be set automatically from your account'),
  body('applicationCycle').not().exists().withMessage('applicationCycle will be set automatically based on the current cycle'),
  body('submittedAt').not().exists().withMessage('submittedAt will be set automatically'),
  body('lastModifiedAt').not().exists().withMessage('lastModifiedAt will be set automatically'),
  body('createdAt').not().exists().withMessage('createdAt will be set automatically'),
  body('updatedAt').not().exists().withMessage('updatedAt will be set automatically'),
  body('firstChoiceStatus').not().exists().withMessage('firstChoiceStatus is managed by reviewers'),
  body('secondChoiceStatus').not().exists().withMessage('secondChoiceStatus is managed by reviewers'),
  body('thirdChoiceStatus').not().exists().withMessage('thirdChoiceStatus is managed by reviewers'),
  body('firstChoiceOfficer1Rating').not().exists().withMessage('firstChoiceOfficer1Rating is managed by reviewers'),
  body('firstChoiceOfficer2Rating').not().exists().withMessage('firstChoiceOfficer2Rating is managed by reviewers'),
  body('firstChoiceNotes').not().exists().withMessage('firstChoiceNotes is managed by reviewers'),
  body('secondChoiceOfficer1Rating').not().exists().withMessage('secondChoiceOfficer1Rating is managed by reviewers'),
  body('secondChoiceOfficer2Rating').not().exists().withMessage('secondChoiceOfficer2Rating is managed by reviewers'),
  body('secondChoiceNotes').not().exists().withMessage('secondChoiceNotes is managed by reviewers'),
  body('thirdChoiceOfficer1Rating').not().exists().withMessage('thirdChoiceOfficer1Rating is managed by reviewers'),
  body('thirdChoiceOfficer2Rating').not().exists().withMessage('thirdChoiceOfficer2Rating is managed by reviewers'),
  body('thirdChoiceNotes').not().exists().withMessage('thirdChoiceNotes is managed by reviewers'),
  body('phone').optional().trim(),
  body('university').trim().notEmpty().withMessage('University is required'),
  body('major').trim().notEmpty().withMessage('Major is required'),
  body('graduationYear')
    .isInt({ min: MIN_GRADUATION_YEAR })
    .withMessage(`Graduation year must be ${MIN_GRADUATION_YEAR} or later`),
  body('resumeUrl').optional().trim().isURL()
    .withMessage('Resume URL must be a valid URL'),
  body('coverLetter').optional().trim(),
  body('firstChoiceCommittee')
    .notEmpty()
    .withMessage('First choice committee is required')
    .isMongoId()
    .withMessage('First choice committee must be a valid MongoDB ID')
    .bail()
    .custom((value) => validateCommitteeById(value, 'first choice')),
  body('secondChoiceCommittee')
    .optional()
    .isMongoId()
    .withMessage('Second choice committee must be a valid MongoDB ID')
    .bail()
    .custom((value) => validateCommitteeById(value, 'second choice')),
  body('thirdChoiceCommittee')
    .optional()
    .isMongoId()
    .withMessage('Third choice committee must be a valid MongoDB ID')
    .bail()
    .custom((value) => validateCommitteeById(value, 'third choice')),
  body('firstChoiceResponses').optional().isArray().withMessage('Responses must be an array'),
  body('firstChoiceResponses.*.questionKey').trim().notEmpty().withMessage('Question key is required'),
  body('firstChoiceResponses.*.question').trim().notEmpty().withMessage('Question text is required'),
  body('firstChoiceResponses.*.answer').trim().notEmpty().withMessage('Answer is required'),
  body('secondChoiceResponses').optional().isArray().withMessage('Responses must be an array'),
  body('secondChoiceResponses.*.questionKey').trim().notEmpty().withMessage('Question key is required'),
  body('secondChoiceResponses.*.question').trim().notEmpty().withMessage('Question text is required'),
  body('secondChoiceResponses.*.answer').trim().notEmpty().withMessage('Answer is required'),
  body('thirdChoiceResponses').optional().isArray().withMessage('Responses must be an array'),
  body('thirdChoiceResponses.*.questionKey').trim().notEmpty().withMessage('Question key is required'),
  body('thirdChoiceResponses.*.question').trim().notEmpty().withMessage('Question text is required'),
  body('thirdChoiceResponses.*.answer').trim().notEmpty().withMessage('Answer is required'),
  // Custom validation to ensure choices are unique and responses match committee questions
  body().custom(async (value) => {
    const committeeIds = [
      value.firstChoiceCommittee,
      value.secondChoiceCommittee,
      value.thirdChoiceCommittee,
    ].filter(Boolean);

    const duplicateIds = getDuplicateValues(committeeIds);
    if (duplicateIds.length > 0) {
      throw new Error('You cannot select the same committee twice');
    }

    await validateCommitteeResponses(
      value.firstChoiceCommittee,
      value.firstChoiceResponses,
      'first choice',
    );
    await validateCommitteeResponses(
      value.secondChoiceCommittee,
      value.secondChoiceResponses,
      'second choice',
    );
    await validateCommitteeResponses(
      value.thirdChoiceCommittee,
      value.thirdChoiceResponses,
      'third choice',
    );

    return true;
  }),
  handleValidationErrors,
];

// Validate application update
const validateUpdateApplication = [
  param('id').isMongoId().withMessage('Invalid application ID'),
  body('userId').not().exists().withMessage('userId cannot be changed'),
  body('firstName').optional().trim().notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty()
    .withMessage('Last name cannot be empty'),
  body('email').optional().trim().isEmail()
    .withMessage('Valid email is required')
    .matches(EMAIL_REGEX)
    .withMessage('Email must be a valid UCLA email address'),
  body('phone').optional().trim(),
  body('university').optional().trim().notEmpty()
    .withMessage('University cannot be empty'),
  body('major').optional().trim().notEmpty()
    .withMessage('Major cannot be empty'),
  body('graduationYear')
    .optional()
    .isInt({ min: MIN_GRADUATION_YEAR })
    .withMessage(`Graduation year must be ${MIN_GRADUATION_YEAR} or later`),
  body('firstChoiceCommittee')
    .optional()
    .isMongoId()
    .withMessage('First choice committee must be a valid MongoDB ID')
    .bail()
    .custom((value) => validateCommitteeById(value, 'first choice')),
  body('secondChoiceCommittee')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Second choice committee must be a valid MongoDB ID')
    .bail()
    .custom((value) => validateCommitteeById(value, 'second choice')),
  body('thirdChoiceCommittee')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Third choice committee must be a valid MongoDB ID')
    .bail()
    .custom((value) => validateCommitteeById(value, 'third choice')),
  body('resumeUrl').optional().trim().isURL()
    .withMessage('Resume URL must be a valid URL'),
  body('coverLetter').optional().trim(),
  body('firstChoiceResponses').optional().isArray().withMessage('Responses must be an array'),
  body('firstChoiceResponses.*.questionKey').optional().trim().notEmpty()
    .withMessage('Question key is required'),
  body('firstChoiceResponses.*.question').optional().trim().notEmpty()
    .withMessage('Question text is required'),
  body('firstChoiceResponses.*.answer').optional().trim().notEmpty()
    .withMessage('Answer is required'),
  body('secondChoiceResponses').optional().isArray().withMessage('Responses must be an array'),
  body('secondChoiceResponses.*.questionKey').optional().trim().notEmpty()
    .withMessage('Question key is required'),
  body('secondChoiceResponses.*.question').optional().trim().notEmpty()
    .withMessage('Question text is required'),
  body('secondChoiceResponses.*.answer').optional().trim().notEmpty()
    .withMessage('Answer is required'),
  body('thirdChoiceResponses').optional().isArray().withMessage('Responses must be an array'),
  body('thirdChoiceResponses.*.questionKey').optional().trim().notEmpty()
    .withMessage('Question key is required'),
  body('thirdChoiceResponses.*.question').optional().trim().notEmpty()
    .withMessage('Question text is required'),
  body('thirdChoiceResponses.*.answer').optional().trim().notEmpty()
    .withMessage('Answer is required'),
  body('firstChoiceStatus').not().exists().withMessage('firstChoiceStatus is managed by reviewers'),
  body('secondChoiceStatus').not().exists().withMessage('secondChoiceStatus is managed by reviewers'),
  body('thirdChoiceStatus').not().exists().withMessage('thirdChoiceStatus is managed by reviewers'),
  body('firstChoiceOfficer1Rating').not().exists().withMessage('firstChoiceOfficer1Rating is managed by reviewers'),
  body('firstChoiceOfficer2Rating').not().exists().withMessage('firstChoiceOfficer2Rating is managed by reviewers'),
  body('firstChoiceNotes').not().exists().withMessage('firstChoiceNotes is managed by reviewers'),
  body('secondChoiceOfficer1Rating').not().exists().withMessage('secondChoiceOfficer1Rating is managed by reviewers'),
  body('secondChoiceOfficer2Rating').not().exists().withMessage('secondChoiceOfficer2Rating is managed by reviewers'),
  body('secondChoiceNotes').not().exists().withMessage('secondChoiceNotes is managed by reviewers'),
  body('thirdChoiceOfficer1Rating').not().exists().withMessage('thirdChoiceOfficer1Rating is managed by reviewers'),
  body('thirdChoiceOfficer2Rating').not().exists().withMessage('thirdChoiceOfficer2Rating is managed by reviewers'),
  body('thirdChoiceNotes').not().exists().withMessage('thirdChoiceNotes is managed by reviewers'),
  handleValidationErrors,
];

// Validate application review status update
const validateUpdateApplicationStatus = [
  param('id').isMongoId().withMessage('Invalid application ID'),
  body('statusField')
    .exists()
    .withMessage('statusField is required')
    .bail()
    .isIn(STATUS_FIELD_OPTIONS)
    .withMessage('statusField must be one of firstChoiceStatus, secondChoiceStatus, thirdChoiceStatus'),
  body('status')
    .exists()
    .withMessage('status is required')
    .bail()
    .isIn(STATUS_OPTIONS)
    .withMessage('Invalid application status'),
  handleValidationErrors,
];

// Validate officer review field update (yes/no ratings and notes)
const validateUpdateApplicationReview = [
  param('id').isMongoId().withMessage('Invalid application ID'),
  body('reviewField')
    .exists()
    .withMessage('reviewField is required')
    .bail()
    .isIn(REVIEW_FIELD_OPTIONS)
    .withMessage(`reviewField must be one of: ${REVIEW_FIELD_OPTIONS.join(', ')}`),
  body('value').custom((value, { req }) => {
    const { reviewField } = req.body;
    const isNotesField = typeof reviewField === 'string' && reviewField.endsWith('Notes');

    if (isNotesField) {
      if (value !== undefined && value !== null && typeof value !== 'string') {
        throw new Error('Notes value must be a string');
      }
      if (typeof value === 'string' && value.length > NOTES_MAX_LENGTH) {
        throw new Error(`Notes must be ${NOTES_MAX_LENGTH} characters or fewer`);
      }
      return true;
    }

    if (value !== null && value !== undefined && !RATING_OPTIONS.includes(value)) {
      throw new Error('Rating value must be "yes", "no", or null');
    }
    return true;
  }),
  handleValidationErrors,
];

// Validate get all applications query
const validateGetApplications = [
  query('firstChoiceStatus')
    .optional()
    .isIn(STATUS_OPTIONS)
    .withMessage('Invalid first choice status filter'),
  query('secondChoiceStatus')
    .optional()
    .isIn(STATUS_OPTIONS)
    .withMessage('Invalid second choice status filter'),
  query('thirdChoiceStatus')
    .optional()
    .isIn(STATUS_OPTIONS)
    .withMessage('Invalid third choice status filter'),
  query('firstChoiceCommittee').optional().isMongoId()
    .withMessage('First choice committee must be a valid MongoDB ID'),
  query('secondChoiceCommittee').optional().isMongoId()
    .withMessage('Second choice committee must be a valid MongoDB ID'),
  query('thirdChoiceCommittee').optional().isMongoId()
    .withMessage('Third choice committee must be a valid MongoDB ID'),
  query('applicationCycle').optional().trim(),
  query('userId').optional().trim(),
  query('search').optional().trim()
    .isLength({ max: 100 })
    .withMessage('Search must be 100 characters or fewer'),
  query('archived').optional().isBoolean()
    .withMessage('archived must be a boolean')
    .toBoolean(),
  query('committeeId').optional().isMongoId().withMessage('committeeId must be a valid MongoDB ID'),
  query('status').optional().isIn(STATUS_OPTIONS).withMessage('Invalid status filter'),
  query('choiceRank').optional().isIn(['1', '2', '3']).withMessage('choiceRank must be 1, 2, or 3'),
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
  validateUpdateApplicationStatus,
  validateUpdateApplicationReview,
  validateGetApplications,
  validateMongoId,
};
