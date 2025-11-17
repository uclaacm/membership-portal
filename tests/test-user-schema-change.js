/* eslint no-console: ["error", { allow: ["log", "error"] }] */

const { setup: setupDB, User, db: Sequelize } = require('../app/db');

let failCount = 0;
const urlFields = ['linkedinUrl', 'githubUrl', 'portfolioUrl', 'personalWebsite'];

async function testFail(test, message) {
  try {
    await test();
    console.error(`FAIL: ${message}`);
    failCount++;
    return false;
  } catch (error) {
    console.log(`PASS: ${error.message}`);
    return true;
  }
}

async function testSuccess(test, message) {
  try {
    await test();
    console.log('PASS: User successfully created');
    return true;
  } catch (error) {
    console.error(`FAIL: ${message} - ${error.message}`);
    failCount++;
    return false;
  }
}

async function main() {
  await setupDB(false, true);

  // Should fail due to bio length limit
  await testFail(async () => {
    await User.create({
      firstName: 'Najeem',
      lastName: 'Honda',
      year: 1,
      major: 'Chopped Science',
      email: 'nhonda@example.com',
      bio: 'foo'.repeat(1000),
    });
  }, 'Bio length limit not enforced');

  // Should fail due to skills array length limit
  await testFail(async () => {
    await User.create({
      firstName: 'Najeem',
      lastName: 'Honda',
      year: 1,
      major: 'Chopped Science',
      email: 'nhonda@example.com',
      skills: Array(25).fill('JavaScript'),
    });
  }, 'Skills array length limit not enforced');

  // Should fail due to skills not being an array
  await testFail(async () => {
    await User.create({
      firstName: 'Najeem',
      lastName: 'Honda',
      year: 1,
      major: 'Chopped Science',
      email: 'nhonda@example.com',
      skills: { stupid: 'dumb' },
    });
  }, 'Skills array type not enforced');

  // Should fail due to skills array containing non-string
  await testFail(async () => {
    await User.create({
      firstName: 'Najeem',
      lastName: 'Honda',
      year: 1,
      major: 'Chopped Science',
      email: 'nhonda@example.com',
      skills: [1, 2, 'buckle my shoe'],
    });
  }, 'Skills array element type not enforced');

  // Should fail due to URL fields being invalid
  await Promise.all(urlFields.map((field) => (
    testFail(async () => {
      await User.create({
        firstName: 'Najeem',
        lastName: 'Honda',
        year: 1,
        major: 'Chopped Science',
        email: 'nhonda@example.com',
        [field]: 'not-a-valid-url',
      });
    }, `URL validation not enforced for ${field}`)
  )));

  // Should succeed with valid data
  await testSuccess(async () => {
    await Sequelize.transaction(async (transaction) => {
      const user = await User.create({
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
      }, { transaction });
      await user.destroy({ transaction });
    });
  }, 'User creation with valid data failed');

  process.exit(failCount > 0 ? 1 : 0);
}

main();
