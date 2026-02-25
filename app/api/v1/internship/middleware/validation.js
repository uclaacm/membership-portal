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

  const requiredQuestions = committee.customQuestions.filter((q) => q.required);
  const responseList = Array.isArray(responses) ? responses : [];
  const answeredQuestionKeys = responseList.map((r) => r.questionKey);

  if (requiredQuestions.length > 0) {
    const missingQuestions = requiredQuestions.filter(
      (q) => !answeredQuestionKeys.includes(q.questionKey),
    );
    if (missingQuestions.length > 0) {
      const missing = missingQuestions.map((q) => q.questionText).join(', ');
      throw new Error(`Missing required questions for ${fieldLabel} committee: ${missing}`);
    }
  }

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
  body('userId').optional().trim(),
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
  body('firstChoiceStatus')
    .optional()
    .isIn(STATUS_OPTIONS)
    .withMessage('Invalid first choice status'),
  body('secondChoiceStatus')
    .optional()
    .isIn(STATUS_OPTIONS)
    .withMessage('Invalid second choice status'),
  body('thirdChoiceStatus')
    .optional()
    .isIn(STATUS_OPTIONS)
    .withMessage('Invalid third choice status'),
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
