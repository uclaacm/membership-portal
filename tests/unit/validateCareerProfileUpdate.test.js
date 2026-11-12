const { validationResult } = require('express-validator');
const {
  validateCareerProfileUpdate,
  validateUserProfileUpdate,
} = require('../../app/api/v1/membership/user/validation');

// linkedinUrl and githubUrl are required, so every career request starts from these.
const REQUIRED_CAREER_FIELDS = {
  linkedinUrl: 'https://www.linkedin.com/in/example',
  githubUrl: 'https://github.com/example',
};

async function runMiddleware(validators, fields) {
  const req = { body: { user: fields } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const middleware of validators) {
    await middleware(req, res, next);
  }

  return { req, res };
}

async function expectSuccess(validators, fields) {
  const { req, res } = await runMiddleware(validators, fields);
  const errors = validationResult(req);
  expect(errors.array()).toEqual([]);
  expect(res.status).not.toHaveBeenCalled();
}

async function expectError(validators, fields, msg, path) {
  const { req, res } = await runMiddleware(validators, fields);
  expect(res.status).toHaveBeenCalledWith(400);

  const errors = validationResult(req);
  expect(errors.isEmpty()).toBe(false);
  expect(errors.array()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        msg,
        path,
      }),
    ]),
  );
}

describe('validateCareerProfileUpdate Middleware', () => {
  const expectCareerSuccess = (fields) => expectSuccess(validateCareerProfileUpdate, fields);
  const expectCareerError = (fields, msg, path) => expectError(
    validateCareerProfileUpdate,
    { ...REQUIRED_CAREER_FIELDS, ...fields },
    msg,
    path,
  );

  it('should pass validation for a valid request body', async () => {
    await expectCareerSuccess({
      ...REQUIRED_CAREER_FIELDS,
      portfolioUrl: 'https://example.com',
      personalWebsite: 'https://example.com',
      resumeUrl: 'https://example.com/resume.pdf',
      skills: ['JavaScript', 'Node.js'],
      careerInterests: ['Software Engineering', 'Web Development'],
    });
  });

  it('should treat empty optional URLs as cleared rather than invalid', async () => {
    await expectCareerSuccess({
      ...REQUIRED_CAREER_FIELDS,
      portfolioUrl: '',
      personalWebsite: '',
      resumeUrl: '',
    });
  });

  it('should fail validation when LinkedIn URL is missing', async () => {
    await expectError(
      validateCareerProfileUpdate,
      { githubUrl: REQUIRED_CAREER_FIELDS.githubUrl },
      'LinkedIn URL is required',
      'user.linkedinUrl',
    );
  });

  it('should fail validation when GitHub URL is missing', async () => {
    await expectError(
      validateCareerProfileUpdate,
      { linkedinUrl: REQUIRED_CAREER_FIELDS.linkedinUrl },
      'GitHub URL is required',
      'user.githubUrl',
    );
  });

  it('should fail validation for an invalid LinkedIn URL', async () => {
    await expectCareerError(
      { linkedinUrl: 'invalid-url' },
      'LinkedIn URL must be a valid linkedin.com URL',
      'user.linkedinUrl',
    );
  });

  it('should fail validation for a LinkedIn URL on another domain', async () => {
    await expectCareerError(
      { linkedinUrl: 'https://example.com/in/example' },
      'LinkedIn URL must be a valid linkedin.com URL',
      'user.linkedinUrl',
    );
  });

  it('should fail validation for an invalid GitHub URL', async () => {
    await expectCareerError(
      { githubUrl: 'invalid-url' },
      'GitHub URL must be a valid github.com URL',
      'user.githubUrl',
    );
  });

  it('should fail validation for an invalid portfolio URL', async () => {
    await expectCareerError(
      { portfolioUrl: 'invalid-url' },
      'Portfolio URL must be a valid URL',
      'user.portfolioUrl',
    );
  });

  it('should fail validation for an invalid personal website URL', async () => {
    await expectCareerError(
      { personalWebsite: 'invalid-url' },
      'Personal website must be a valid URL',
      'user.personalWebsite',
    );
  });

  it('should fail validation for too many career interests', async () => {
    await expectCareerError(
      { careerInterests: new Array(21).fill('Interest') },
      'Career interests must be an array with max 20 items',
      'user.careerInterests',
    );
  });

  it('should fail validation for a career interest exceeding character limit', async () => {
    await expectCareerError(
      { careerInterests: ['A'.repeat(51)] },
      'Each career interest must be 1-50 characters',
      'user.careerInterests[0]',
    );
  });

  it('should escape HTML entities in skills', async () => {
    const { req } = await runMiddleware(validateCareerProfileUpdate, {
      ...REQUIRED_CAREER_FIELDS,
      skills: ['<b>bold</b>'],
    });
    expect(req.body.user.skills[0]).toBe('&lt;b&gt;bold&lt;&#x2F;b&gt;');
  });

  it('should escape HTML entities in career interests', async () => {
    const { req } = await runMiddleware(validateCareerProfileUpdate, {
      ...REQUIRED_CAREER_FIELDS,
      careerInterests: ['<i>italic</i>'],
    });
    expect(req.body.user.careerInterests[0]).toBe('&lt;i&gt;italic&lt;&#x2F;i&gt;');
  });
});

// bio, pronouns, and isProfilePublic are validated on PATCH /user, not PATCH /user/career.
describe('validateUserProfileUpdate Middleware', () => {
  it('should pass validation for a valid request body', async () => {
    await expectSuccess(validateUserProfileUpdate, {
      bio: 'This is a valid bio.',
      pronouns: 'they/them',
      isProfilePublic: true,
    });
  });

  it('should fail validation for pronouns exceeding character limit', async () => {
    await expectError(
      validateUserProfileUpdate,
      { pronouns: 'A'.repeat(51) },
      'Pronouns must be 50 characters or less',
      'user.pronouns',
    );
  });

  it('should escape HTML entities in bio', async () => {
    const { req } = await runMiddleware(validateUserProfileUpdate, {
      bio: '<script>alert("XSS")</script>',
    });
    expect(req.body.user.bio).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
  });
});
