// User.build() creates an in-memory instance, so these tests never touch the database.
const { User } = require('../../app/db');

const completeUserData = {
  firstName: 'John',
  lastName: 'Doe',
  year: 3,
  major: 'Computer Science',
  email: 'johndoe@example.com',
  picture: 'https://example.com/john.png',
  points: 120,
  pronouns: 'he/him',
  bio: 'A passionate software developer.',
  skills: ['JavaScript', 'Node.js', 'React'],
  careerInterests: ['Web Development', 'AI'],
  linkedinUrl: 'https://www.linkedin.com/in/johndoe',
  githubUrl: 'https://github.com/johndoe',
  portfolioUrl: 'https://johndoe.dev',
  personalWebsite: 'https://johndoe.com',
  resumeUrl: 'https://johndoe.dev/resume.pdf',
  isProfilePublic: true,
};

const buildUser = (overrides = {}) => User.build({ ...completeUserData, ...overrides });

describe('User profile methods', () => {
  describe('getBaseProfile', () => {
    it('returns only the base fields', () => {
      const user = buildUser();

      expect(user.getBaseProfile()).toEqual({
        id: user.getDataValue('uuid'),
        firstName: 'John',
        lastName: 'Doe',
        picture: 'https://example.com/john.png',
        points: 120,
        pronouns: 'he/him',
      });
    });
  });

  describe('getPublicProfile', () => {
    it('returns the career-facing fields when the profile is public', () => {
      expect(buildUser().getPublicProfile()).toEqual({
        bio: 'A passionate software developer.',
        skills: ['JavaScript', 'Node.js', 'React'],
        careerInterests: ['Web Development', 'AI'],
        linkedinUrl: 'https://www.linkedin.com/in/johndoe',
        githubUrl: 'https://github.com/johndoe',
        portfolioUrl: 'https://johndoe.dev',
        personalWebsite: 'https://johndoe.com',
      });
    });

    it('never exposes contact or resume details', () => {
      const publicProfile = buildUser().getPublicProfile();

      expect(publicProfile).not.toHaveProperty('email');
      expect(publicProfile).not.toHaveProperty('resumeUrl');
    });

    it('returns null when the profile is private', () => {
      expect(buildUser({ isProfilePublic: false }).getPublicProfile()).toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('returns the full profile for the user themselves', () => {
      const user = buildUser({ committees: ['Hack'] });

      expect(user.getUserProfile()).toEqual({
        uuid: user.getDataValue('uuid'),
        firstName: 'John',
        lastName: 'Doe',
        picture: 'https://example.com/john.png',
        email: 'johndoe@example.com',
        year: 3,
        major: 'Computer Science',
        points: 120,
        pronouns: 'he/him',
        bio: 'A passionate software developer.',
        isProfilePublic: true,
        isOfficer: false,
        committees: ['Hack'],
      });
    });

    it('reports officers as officers', () => {
      expect(buildUser({ accessType: 'OFFICER' }).getUserProfile().isOfficer).toBe(true);
    });
  });

  describe('getCareerProfile', () => {
    it('returns the career fields including the resume', () => {
      expect(buildUser().getCareerProfile()).toEqual({
        linkedinUrl: 'https://www.linkedin.com/in/johndoe',
        githubUrl: 'https://github.com/johndoe',
        portfolioUrl: 'https://johndoe.dev',
        personalWebsite: 'https://johndoe.com',
        resumeUrl: 'https://johndoe.dev/resume.pdf',
        skills: ['JavaScript', 'Node.js', 'React'],
        careerInterests: ['Web Development', 'AI'],
      });
    });
  });

  describe('hasCompleteProfile', () => {
    it('is true when bio, major, year, skills, and career interests are all filled in', () => {
      expect(buildUser().hasCompleteProfile()).toBe(true);
    });

    it.each([
      ['bio', ''],
      ['major', ''],
      ['year', null],
      ['skills', []],
      ['careerInterests', []],
    ])('is false when %s is empty', (field, emptyValue) => {
      expect(buildUser({ [field]: emptyValue }).hasCompleteProfile()).toBe(false);
    });
  });
});
