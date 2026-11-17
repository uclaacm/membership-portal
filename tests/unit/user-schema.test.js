// These are Sequelize model validations, which run in validate() before anything is sent to
// the database, so User.build() is enough and no connection is needed.
const { User } = require('../../app/db');

const baseUserData = {
  firstName: 'Najeem',
  lastName: 'Honda',
  year: 1,
  major: 'Chopped Science',
  email: 'nhonda@example.com',
};

const validate = (overrides) => User.build({ ...baseUserData, ...overrides }).validate();

describe('User schema career field validation', () => {
  it('accepts a user with valid career fields', async () => {
    await expect(validate({
      bio: 'This is a valid bio.',
      skills: ['JavaScript', 'Node.js', 'React'],
      careerInterests: ['Software Engineering', 'Data Science', 'Product Management'],
      linkedinUrl: 'https://www.linkedin.com/in/najeemhonda',
      githubUrl: 'https://github.com/najeemhonda',
      portfolioUrl: 'https://najeemhonda.dev',
      personalWebsite: 'https://najeemhonda.com',
      resumeUrl: 'https://najeemhonda.dev/resume.pdf',
    })).resolves.toBeDefined();
  });

  it('rejects a bio longer than 1000 characters', async () => {
    await expect(validate({ bio: 'a'.repeat(1001) }))
      .rejects.toThrow('Your bio must be at most 1000 characters long');
  });

  it('accepts a bio of exactly 1000 characters', async () => {
    await expect(validate({ bio: 'a'.repeat(1000) })).resolves.toBeDefined();
  });

  describe.each([
    ['skills', 'Skills', 'skill'],
    ['careerInterests', 'Career interests', 'career interest'],
  ])('%s', (field, label, itemLabel) => {
    it('rejects a non-array value', async () => {
      await expect(validate({ [field]: { not: 'an array' } }))
        .rejects.toThrow(`${label} must be an array`);
    });

    it('rejects more than 20 items', async () => {
      await expect(validate({ [field]: Array(21).fill('item') }))
        .rejects.toThrow('may not have more than 20 items');
    });

    it('accepts exactly 20 items', async () => {
      await expect(validate({ [field]: Array(20).fill('item') })).resolves.toBeDefined();
    });

    it('rejects non-string items', async () => {
      await expect(validate({ [field]: [1, 2, 'buckle my shoe'] }))
        .rejects.toThrow(`Each ${itemLabel} must be a string`);
    });
  });

  it.each([
    ['linkedinUrl', 'The LinkedIn URL must be a valid URL'],
    ['githubUrl', 'The GitHub URL must be a valid URL'],
    ['portfolioUrl', 'The portfolio URL must be a valid URL'],
    ['personalWebsite', 'The personal website URL must be a valid URL'],
    ['resumeUrl', 'The resume URL must be a valid URL'],
  ])('rejects an invalid %s', async (field, message) => {
    await expect(validate({ [field]: 'not-a-valid-url' })).rejects.toThrow(message);
  });

  it.each([
    ['linkedinUrl', 'https://example.com/in/najeemhonda'],
    ['githubUrl', 'https://gitlab.com/najeemhonda'],
  ])('rejects a %s on another domain', async (field, url) => {
    await expect(validate({ [field]: url })).rejects.toThrow();
  });
});
