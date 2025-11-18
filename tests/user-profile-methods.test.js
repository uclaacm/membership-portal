const { setup: setupDB, User } = require('../app/db');
const log = require('../app/logger');

let passCount = 0;
let testCount = 0;

function getUnequalKeys(obj1, obj2, keys) {
  return keys.filter((key) => obj1[key] !== obj2[key]);
}

async function testGetPublicProfile(user) {
  const publicProfile = user.getPublicProfile();
  const expectedProfile = {
    firstName: user.firstName,
    lastName: user.lastName,
    picture: undefined,
    points: 0,
    pronouns: undefined,
    bio: user.bio,
    skills: user.skills,
    careerInterests: user.careerInterests,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl,
    portfolioUrl: user.portfolioUrl,
    personalWebsite: user.personalWebsite,
  };

  const keys = Object.keys(expectedProfile);
  const unequalKeys = getUnequalKeys(publicProfile, expectedProfile, keys);
  if (unequalKeys.length === 0) {
    log.info('PASS: getPublicProfile works as expected');
    passCount++;
  } else {
    unequalKeys.forEach((key) => {
      log.error(`FAIL: getPublicProfile - Key: ${key}, Expected: ${expectedProfile[key]}, Actual: ${publicProfile[key]}`);
    });
  }
}

async function testGetPublicProfilePrivate(user) {
  const privateUser = User.build({
    ...user.get(),
    isProfilePublic: false,
  });
  const publicProfile = privateUser.getPublicProfile();
  const expectedProfile = {
    firstName: privateUser.firstName,
    lastName: privateUser.lastName,
    picture: undefined,
    points: 0,
    pronouns: undefined,
  };

  const keys = Object.keys(expectedProfile);
  const unequalKeys = getUnequalKeys(publicProfile, expectedProfile, keys);
  if (unequalKeys.length === 0) {
    log.info('PASS: getPublicProfile (private) works as expected');
    passCount++;
  } else {
    unequalKeys.forEach((key) => {
      log.error(`FAIL: getPublicProfile (private) - Key: ${key}, Expected: ${expectedProfile[key]}, Actual: ${publicProfile[key]}`);
    });
  }
}

async function testGetUserProfile(user) {
  const userProfile = user.getUserProfile();
  const expectedProfile = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    year: user.year,
    major: user.major,
    bio: user.bio,
    skills: user.skills,
    careerInterests: user.careerInterests,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl,
    portfolioUrl: user.portfolioUrl,
    personalWebsite: user.personalWebsite,
    isProfilePublic: user.isProfilePublic,
  };

  const keys = Object.keys(expectedProfile);
  const unequalKeys = getUnequalKeys(userProfile, expectedProfile, keys);
  if (unequalKeys.length === 0) {
    log.info('PASS: getUserProfile works as expected');
    passCount++;
  } else {
    unequalKeys.forEach((key) => {
      log.error(`FAIL: getUserProfile - Key: ${key}, Expected: ${expectedProfile[key]}, Actual: ${userProfile[key]}`);
    });
  }
}

async function testGetCareerProfile(user) {
  const careerProfile = user.getCareerProfile();
  const expectedProfile = {
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    major: user.major,
    year: user.year,
    skills: user.skills,
    careerInterests: user.careerInterests,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl,
    portfolioUrl: user.portfolioUrl,
    personalWebsite: user.personalWebsite,
    isProfilePublic: user.isProfilePublic,
  };

  const keys = Object.keys(expectedProfile);
  const unequalKeys = getUnequalKeys(careerProfile, expectedProfile, keys);
  if (unequalKeys.length === 0) {
    log.info('PASS: getCareerProfile works as expected');
    passCount++;
  } else {
    unequalKeys.forEach((key) => {
      log.error(`FAIL: getCareerProfile - Key: ${key}, Expected: ${expectedProfile[key]}, Actual: ${careerProfile[key]}`);
    });
  }
}

async function testHasCompleteProfile(user) {
  const hasCompleteProfile = user.hasCompleteProfile();
  if (hasCompleteProfile === true) {
    log.info('PASS: hasCompleteProfile works as expected');
    passCount++;
  } else {
    log.error('FAIL: hasCompleteProfile does not work as expected');
  }
}

async function testHasIncompleteProfile(user) {
  const hasCompleteProfile = user.hasCompleteProfile();
  if (hasCompleteProfile === false) {
    log.info('PASS: hasCompleteProfile correctly identifies an incomplete profile');
    passCount++;
  } else {
    log.error('FAIL: hasCompleteProfile incorrectly identifies an incomplete profile');
  }
}

async function main() {
  await setupDB(false, true);

  const completeUserData = {
    firstName: 'John',
    lastName: 'Doe',
    year: 3,
    major: 'Computer Science',
    email: 'johndoe@example.com',
    bio: 'A passionate software developer.',
    skills: ['JavaScript', 'Node.js', 'React'],
    careerInterests: ['Web Development', 'AI'],
    linkedinUrl: 'https://www.linkedin.com/in/johndoe',
    githubUrl: 'https://github.com/johndoe',
    portfolioUrl: 'https://johndoe.dev',
    personalWebsite: 'https://johndoe.com',
    isProfilePublic: true,
  };

  const incompleteUserData = {
    firstName: 'Jane',
    lastName: 'Doe',
    year: null, // Missing year
    major: '', // Missing major
    email: 'janedoe@example.com',
    bio: '', // Missing bio
    skills: [],
    careerInterests: [],
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    personalWebsite: '',
    isProfilePublic: false,
  };

  const completeUser = User.build(completeUserData);
  const incompleteUser = User.build(incompleteUserData);

  await testGetPublicProfile(completeUser);
  await testGetPublicProfilePrivate(completeUser);
  await testGetUserProfile(completeUser);
  await testGetCareerProfile(completeUser);
  await testHasCompleteProfile(completeUser);
  await testHasIncompleteProfile(incompleteUser);

  testCount = 6;

  if (passCount === testCount) {
    log.info('\nAll tests passed!');
    process.exit(0);
  } else {
    log.error(`\nOnly ${passCount} out of ${testCount} tests passed.`);
    process.exit(1);
  }
}

main();
