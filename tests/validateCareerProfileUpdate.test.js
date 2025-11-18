const { validationResult } = require('express-validator');
const { validateCareerProfileUpdate } = require('../app/api/v1/membership/user/validation');

async function runMiddleware(fields) {
  const req = { body: { user: fields } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const middleware of validateCareerProfileUpdate) {
    await middleware(req, res, next);
  }

  return { req, res };
}

async function expectSuccess(fields) {
  const { req } = await runMiddleware(fields);
  const errors = validationResult(req);
  expect(errors.isEmpty()).toBe(true);
}

async function expectError(fields, msg, path) {
  const { req, res } = await runMiddleware(fields);
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
  it('should pass validation for a valid request body', () => {
    expectSuccess({
      bio: 'This is a valid bio.',
      linkedinUrl: 'https://www.linkedin.com/in/example',
      githubUrl: 'https://github.com/example',
      portfolioUrl: 'https://example.com',
      personalWebsite: 'https://example.com',
      skills: ['JavaScript', 'Node.js'],
      careerInterests: ['Software Engineering', 'Web Development'],
      pronouns: 'they/them',
      isProfilePublic: true,
    });
  });

  it('should fail validation for an invalid LinkedIn URL', () => {
    expectError(
      {
        linkedinUrl: 'invalid-url',
      },
      'LinkedIn URL must be a valid URL',
      'user.linkedinUrl',
    );
  });

  it('should fail validation for an invalid GitHub URL', () => {
    expectError(
      {
        githubUrl: 'invalid-url',
      },
      'GitHub URL must be a valid URL',
      'user.githubUrl',
    );
  });

  it('should fail validation for an invalid portfolio URL', () => {
    expectError(
      {
        portfolioUrl: 'invalid-url',
      },
      'Portfolio URL must be a valid URL',
      'user.portfolioUrl',
    );
  });

  it('should fail validation for an invalid personal website URL', () => {
    expectError(
      {
        personalWebsite: 'invalid-url',
      },
      'Personal website must be a valid URL',
      'user.personalWebsite',
    );
  });

  it('should fail validation for too many career interests', () => {
    expectError(
      {
        careerInterests: new Array(21).fill('Interest'),
      },
      'Career interests must be an array with max 20 items',
      'user.careerInterests',
    );
  });

  it('should fail validation for a career interest exceeding character limit', () => {
    expectError(
      {
        careerInterests: ['A'.repeat(51)],
      },
      'Each career interest must be 1-50 characters',
      'user.careerInterests[0]',
    );
  });

  it('should fail validation for pronouns exceeding character limit', () => {
    expectError(
      {
        pronouns: 'A'.repeat(51),
      },
      'Pronouns must be 50 characters or less',
      'user.pronouns',
    );
  });

  it('should escape HTML entities in bio', async () => {
    const { req } = await runMiddleware({
      bio: '<script>alert("XSS")</script>',
    });
    expect(req.body.user.bio).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
  });

  it('should escape HTML entities in skills', async () => {
    const { req } = await runMiddleware({
      skills: ['<b>bold</b>'],
    });
    expect(req.body.user.skills[0]).toBe('&lt;b&gt;bold&lt;&#x2F;b&gt;');
  });

  it('should escape HTML entities in career interests', async () => {
    const { req } = await runMiddleware({
      careerInterests: ['<i>italic</i>'],
    });
    expect(req.body.user.careerInterests[0]).toBe('&lt;i&gt;italic&lt;&#x2F;i&gt;');
  });
});
