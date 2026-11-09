const { setup: setupDB, User, db: Sequelize } = require('../app/db');
const log = require('../app/logger');

let passCount = 0;
let testCount = 0;
const urlFields = ['linkedinUrl', 'githubUrl', 'portfolioUrl', 'personalWebsite'];

async function createAndDestroy(userData) {
  await Sequelize.transaction(async (transaction) => {
    const user = await User.create(userData, { transaction });
    await user.destroy({ transaction });
  });
}

async function testFail(userData, message) {
  testCount++;
  try {
    await createAndDestroy(userData);
    log.error(`FAIL: ${message}`);
    return false;
  } catch (error) {
    log.info(`PASS: ${error.message}`);
    passCount++;
    return true;
  }
}

async function testSuccess(userData, message) {
  testCount++;
  try {
    await createAndDestroy(userData);
    log.info('PASS: User successfully created');
    passCount++;
    return true;
  } catch (error) {
    log.error(`FAIL: ${message} - ${error.message}`);
    return false;
  }
}

async function main() {
  await setupDB(false, true);

  // Should fail due to bio length limit
  await testFail({
    firstName: 'Najeem',
    lastName: 'Honda',
    year: 1,
    major: 'Chopped Science',
    email: 'nhonda@example.com',
    bio: 'foo'.repeat(1000),
  }, 'Bio length limit not enforced');

  // Should fail due to skills array length limit
  await testFail({
    firstName: 'Najeem',
    lastName: 'Honda',
    year: 1,
    major: 'Chopped Science',
    email: 'nhonda@example.com',
    skills: Array(25).fill('JavaScript'),
  }, 'Skills array length limit not enforced');

  // Should fail due to skills not being an array
  await testFail({
    firstName: 'Najeem',
    lastName: 'Honda',
    year: 1,
    major: 'Chopped Science',
    email: 'nhonda@example.com',
    skills: { stupid: 'dumb' },
  }, 'Skills array type not enforced');

  // Should fail due to skills array containing non-string
  await testFail({
    firstName: 'Najeem',
    lastName: 'Honda',
    year: 1,
    major: 'Chopped Science',
    email: 'nhonda@example.com',
    skills: [1, 2, 'buckle my shoe'],
  }, 'Skills array element type not enforced');

  // Should fail due to URL fields being invalid
  await Promise.all(urlFields.map((field) => (
    testFail({
      firstName: 'Najeem',
      lastName: 'Honda',
      year: 1,
      major: 'Chopped Science',
      email: 'nhonda@example.com',
      [field]: 'not-a-valid-url',
    }, `URL validation not enforced for ${field}`)
  )));

  // Should succeed with valid data
  await testSuccess({
    firstName: 'Najeem',
    lastName: 'Honda',
    year: 1,
    major: 'Chopped Science',
    email: 'nhonda@example.com',
    bio: 'This is a valid bio.',
    skills: ['JavaScript', 'Node.js', 'React'],
    linkedinUrl: 'https://www.linkedin.com/in/najeemhonda',
    githubUrl: 'https://github.com/najeemhonda',
    portfolioUrl: 'https://najeemhonda.dev',
    personalWebsite: 'https://najeemhonda.com',
  }, 'User creation with valid data failed');

  // Should fail due to careerInterests not being an array
  await testFail({
    firstName: 'Najeem',
    lastName: 'Honda',
    year: 1,
    major: 'Chopped Science',
    email: 'nhonda@example.com',
    careerInterests: { invalid: 'data' },
  }, 'Career interests array type not enforced');

  // Should fail due to careerInterests array length limit
  await testFail({
    firstName: 'Najeem',
    lastName: 'Honda',
    year: 1,
    major: 'Chopped Science',
    email: 'nhonda@example.com',
    careerInterests: Array(25).fill('Software Engineering'),
  }, 'Career interests array length limit not enforced');

  // Should fail due to careerInterests array containing non-string
  await testFail({
    firstName: 'Najeem',
    lastName: 'Honda',
    year: 1,
    major: 'Chopped Science',
    email: 'nhonda@example.com',
    careerInterests: [1, 2, 'Data Science'],
  }, 'Career interests array element type not enforced');

  // Should succeed with valid careerInterests
  await testSuccess({
    firstName: 'Najeem',
    lastName: 'Honda',
    year: 1,
    major: 'Chopped Science',
    email: 'nhonda@example.com',
    careerInterests: ['Software Engineering', 'Data Science', 'Product Management'],
  }, 'Career interests validation failed for valid data');

  if (passCount === testCount) {
    log.info('\nAll tests passed!');
    process.exit(0);
  } else {
    log.error(`\nOnly ${passCount} out of ${testCount} tests passed.`);
    process.exit(1);
  }
}

main();
