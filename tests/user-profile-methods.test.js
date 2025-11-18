const { setup: setupDB, User } = require('../app/db');
const log = require('../app/logger');

let passCount = 0;
let testCount = 0;

function getUnequalKeys(obj1, obj2, keys) {
  return keys.filter((key) => obj1[key] !== obj2[key]);
}

async function testGetBaseProfile(user) {
  const baseProfile = user.getBaseProfile();
  const expectedBaseProfile = {
    firstName: user.getDataValue('firstName'),
    lastName: user.getDataValue('lastName'),
    picture: user.getDataValue('picture'),
    points: user.getDataValue('points'),
    pronouns: user.getDataValue('pronouns'),
  };

  const baseKeys = Object.keys(expectedBaseProfile);
  const unequalBaseKeys = getUnequalKeys(baseProfile, expectedBaseProfile, baseKeys);
  if (unequalBaseKeys.length === 0) {
    log.info('PASS: getBaseProfile works as expected');
    passCount++;
  } else {
    unequalBaseKeys.forEach((key) => {
      log.error(`FAIL: getBaseProfile - Key: ${key}, Expected: ${expectedBaseProfile[key]}, Actual: ${baseProfile[key]}`);
    });
  }
}

async function testGetPublicProfile(user) {
  const publicProfile = user.getPublicProfile();
  const expectedPublicProfile = user.getDataValue('isProfilePublic')
    ? {
      bio: user.getDataValue('bio'),
      skills: user.getDataValue('skills'),
      careerInterests: user.getDataValue('careerInterests'),
      linkedinUrl: user.getDataValue('linkedinUrl'),
      githubUrl: user.getDataValue('githubUrl'),
      portfolioUrl: user.getDataValue('portfolioUrl'),
      personalWebsite: user.getDataValue('personalWebsite'),
    }
    : null;

  if (expectedPublicProfile === null) {
    log.error('FAIL: getPublicProfile - Expected null for private profile, but got:', publicProfile);
    return;
  }

  const publicKeys = Object.keys(expectedPublicProfile);
  const unequalPublicKeys = getUnequalKeys(publicProfile, expectedPublicProfile, publicKeys);
  if (unequalPublicKeys.length === 0) {
    log.info('PASS: getPublicProfile works as expected');
    passCount++;
  } else {
    unequalPublicKeys.forEach((key) => {
      log.error(`FAIL: getPublicProfile - Key: ${key}, Expected: ${expectedPublicProfile[key]}, Actual: ${publicProfile[key]}`);
    });
  }
}

async function testGetPublicProfilePrivate(user) {
  const privateUser = User.build({
    ...user.get(),
    isProfilePublic: false,
  });

  const publicProfile = privateUser.getPublicProfile();
  if (publicProfile === null) {
    log.info('PASS: getPublicProfile (private) correctly returns null');
    passCount++;
  } else {
    log.error('FAIL: getPublicProfile (private) did not return null');
  }
}

async function testGetUserProfile(user) {
  const userProfile = user.getUserProfile();
  const expectedProfile = {
    uuid: user.getDataValue('uuid'),
    firstName: user.getDataValue('firstName'),
    lastName: user.getDataValue('lastName'),
    picture: user.getDataValue('picture'),
    email: user.getDataValue('email'),
    year: user.getDataValue('year'),
    major: user.getDataValue('major'),
    points: user.getDataValue('points'),
    pronouns: user.getDataValue('pronouns'),
    bio: user.getDataValue('bio'),
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
    linkedinUrl: user.getDataValue('linkedinUrl'),
    githubUrl: user.getDataValue('githubUrl'),
    portfolioUrl: user.getDataValue('portfolioUrl'),
    personalWebsite: user.getDataValue('personalWebsite'),
    resumeUrl: user.getDataValue('resumeUrl'),
    skills: user.getDataValue('skills'),
    careerInterests: user.getDataValue('careerInterests'),
    isProfilePublic: user.getDataValue('isProfilePublic'),
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
  const expected = !!(
    user.getDataValue('bio')
    && user.getDataValue('major')
    && user.getDataValue('year')
    && user.getDataValue('skills')
    && user.getDataValue('skills').length > 0
    && user.getDataValue('careerInterests')
    && user.getDataValue('careerInterests').length > 0
  );

  if (hasCompleteProfile === expected) {
    log.info('PASS: hasCompleteProfile works as expected');
    passCount++;
  } else {
    log.error('FAIL: hasCompleteProfile - Expected:', expected, ', Actual:', hasCompleteProfile);
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

  await testGetBaseProfile(completeUser);
  await testGetPublicProfile(completeUser);
  await testGetPublicProfilePrivate(incompleteUser);
  await testGetUserProfile(completeUser);
  await testGetCareerProfile(completeUser);
  await testHasCompleteProfile(completeUser);
  await testHasCompleteProfile(incompleteUser);

  testCount = 7;

  if (passCount >= testCount) {
    log.info('\nAll tests passed!');
    process.exit(0);
  } else {
    log.error(`\nOnly ${passCount} out of ${testCount} tests passed.`);
    process.exit(1);
  }
}

main();
