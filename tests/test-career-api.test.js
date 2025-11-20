const request = require('supertest');

const baseUrl = 'http://localhost:8080/app/api/v1';

let token;

// Basic HTML escaping function
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  const escapedChars = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => escapedChars[char]);
};

beforeAll(async () => {
  const response = await request(baseUrl)
    .post('/auth/dev-login')
    .send({});

  token = response.body.token;
});

describe('PATCH /user/', () => {
  const headers = () => ({ Authorization: `Bearer ${token}` });

  const testValidation = async (field, invalidValue, expectedErrorPath) => {
    const response = await request(baseUrl)
      .patch('/user/')
      .set(headers())
      .send({ user: { [field]: invalidValue } });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: `user.${expectedErrorPath}` }),
      ]),
    );
  };

  it('validates firstName as a string', async () => {
    await testValidation('firstName', 123, 'firstName');
  });

  it('validates lastName as a string', async () => {
    await testValidation('lastName', 123, 'lastName');
  });

  it('validates major as a string', async () => {
    await testValidation('major', 123, 'major');
  });

  it('validates year as an integer between 1 and 5', async () => {
    await testValidation('year', 6, 'year');
    await testValidation('year', 'not-a-number', 'year');
  });

  it('validates bio as a string with max 1000 characters', async () => {
    await testValidation('bio', 'a'.repeat(1001), 'bio');
  });

  it('validates linkedinUrl as a valid URL', async () => {
    await testValidation('linkedinUrl', 'invalid-url', 'linkedinUrl');
  });

  it('validates githubUrl as a valid URL', async () => {
    await testValidation('githubUrl', 'invalid-url', 'githubUrl');
  });

  it('validates portfolioUrl as a valid URL', async () => {
    await testValidation('portfolioUrl', 'invalid-url', 'portfolioUrl');
  });

  it('validates personalWebsite as a valid URL', async () => {
    await testValidation('personalWebsite', 'invalid-url', 'personalWebsite');
  });

  it('validates skills as an array with max 20 items', async () => {
    await testValidation('skills', Array(21).fill('skill'), 'skills');
  });

  it('validates each skill as a string between 1 and 50 characters', async () => {
    await testValidation('skills', [''], 'skills[0]');
    await testValidation('skills', ['a'.repeat(51)], 'skills[0]');
  });

  it('validates careerInterests as an array with max 20 items', async () => {
    await testValidation('careerInterests', Array(21).fill('interest'), 'careerInterests');
  });

  it('validates each career interest as a string between 1 and 50 characters', async () => {
    await testValidation('careerInterests', [''], 'careerInterests[0]');
    await testValidation('careerInterests', ['a'.repeat(51)], 'careerInterests[0]');
  });

  it('validates pronouns as a string with max 50 characters', async () => {
    await testValidation('pronouns', 'a'.repeat(51), 'pronouns');
  });

  it('validates isProfilePublic as a boolean', async () => {
    await testValidation('isProfilePublic', 'not-a-boolean', 'isProfilePublic');
  });

  it('updates user fields successfully', async () => {
    const updatedFields = {
      firstName: 'John',
      lastName: 'Doe',
      major: 'Computer Science',
      year: 3,
      bio: 'This is a <bio>.',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      githubUrl: 'https://github.com/johndoe',
      portfolioUrl: 'https://portfolio.com/johndoe',
      personalWebsite: 'https://johndoe.com',
      skills: ['JavaScript', 'Node.js'],
      careerInterests: ['Software Engineering', 'Web Development'],
      pronouns: 'he/him',
      isProfilePublic: true,
    };

    const response = await request(baseUrl)
      .patch('/user/')
      .set(headers())
      .send({ user: updatedFields });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');

    Object.entries(updatedFields).forEach(([key, value]) => {
      let expectedValue;
      if (['bio', 'skills', 'careerInterests', 'pronouns'].includes(key)) {
        expectedValue = Array.isArray(value) ? value.map(escapeHtml) : escapeHtml(value);
      } else {
        expectedValue = value;
      }
      expect(response.body.user[key]).toEqual(expectedValue);
    });
  });

  it('ignores empty strings for firstName, lastName, and major', async () => {
    const initialFields = {
      firstName: 'John',
      lastName: 'Doe',
      major: 'Computer Science',
    };

    // Set initial values
    await request(baseUrl)
      .patch('/user/')
      .set(headers())
      .send({ user: initialFields });

    const response = await request(baseUrl)
      .patch('/user/')
      .set(headers())
      .send({ user: { firstName: '', lastName: '', major: '' } });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');

    // Ensure the fields were not overwritten
    expect(response.body.user.firstName).toEqual(initialFields.firstName);
    expect(response.body.user.lastName).toEqual(initialFields.lastName);
    expect(response.body.user.major).toEqual(initialFields.major);
  });

  it('rejects linkedinUrl with an invalid domain', async () => {
    await testValidation('linkedinUrl', 'https://example.com/in/johndoe', 'linkedinUrl');
  });

  it('rejects githubUrl with an invalid domain', async () => {
    await testValidation('githubUrl', 'https://example.com/johndoe', 'githubUrl');
  });

  it('accepts linkedinUrl with www in the domain', async () => {
    const response = await request(baseUrl)
      .patch('/user/')
      .set(headers())
      .send({ user: { linkedinUrl: 'https://www.linkedin.com/in/johndoe' } });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user.linkedinUrl', 'https://www.linkedin.com/in/johndoe');
  });

  it('accepts githubUrl with www in the domain', async () => {
    const response = await request(baseUrl)
      .patch('/user/')
      .set(headers())
      .send({ user: { githubUrl: 'https://www.github.com/johndoe' } });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user.githubUrl', 'https://www.github.com/johndoe');
  });
});
