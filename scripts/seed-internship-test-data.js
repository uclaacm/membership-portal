require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');

const { db, User } = require('../app/db');
const { Committee } = require('../app/api/v1/internship/models/Committee');
const {
  InternshipApplication,
  getCurrentApplicationCycle,
} = require('../app/api/v1/internship/models/InternshipApplication');

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT; 
const mongoDatabase = process.env.MONGO_DATABASE;
const mongoUser = process.env.MONGO_ROOT_USERNAME;
const mongoPassword = process.env.MONGO_ROOT_PASSWORD;
const mongoUri = process.env.MONGODB_URI
  || `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDatabase}?authSource=admin`;
const seedEmail = process.env.SEED_EMAIL || process.env.SEED_USER_EMAIL || '';
const seedUuid = process.env.SEED_USER_UUID || '';
const applicationCycle = process.env.SEED_APPLICATION_CYCLE || getCurrentApplicationCycle();
const applicationStatus = (process.env.SEED_STATUS).toLowerCase();
const committeeNames = (process.env.SEED_COMMITTEES)
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

function getCommitteeSeed(name, index) {
  const normalized = name.trim();
  const displayName = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return {
    update: {
      name: displayName,
      displayName,
      subcommittees: [],
      isActive: process.env.SEED_ACTIVE_COMMITTEES === 'false' ? index === 0 : true,
      internLimit: Number(process.env.SEED_INTERN_LIMIT || 10),
      applicationDeadline: new Date(process.env.SEED_APPLICATION_DEADLINE || '2030-10-15T23:59:59.000Z'),
      customQuestions: [],
      updatedAt: new Date(),
    },
    insert: {
      description: `${displayName} committee used for internship testing.`,
      createdAt: new Date(),
    },
  };
}

async function seedCommittee(seed) {
  const committee = await Committee.findOneAndUpdate(
    { name: seed.update.name },
    {
      $set: seed.update,
      $setOnInsert: seed.insert,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return committee;
}

async function resolveSeedUser() {
  if (seedUuid) {
    const userByUuid = await User.findOne({ where: { uuid: seedUuid } });
    if (userByUuid) return userByUuid;
    throw new Error(`No Postgres user found for UUID ${seedUuid}.`);
  }

  if (seedEmail) {
    const userByEmail = await User.findOne({ where: { email: seedEmail } });
    if (userByEmail) return userByEmail;
    throw new Error(`No Postgres user found for email ${seedEmail}.`);
  }

  throw new Error('Set SEED_EMAIL or SEED_USER_UUID to choose which Postgres user to seed for.');
}

async function main() {
  try {
    if (!['draft', 'submitted'].includes(applicationStatus)) {
      throw new Error("SEED_STATUS must be either 'draft' or 'submitted'.");
    }

    await db.authenticate();
    await mongoose.connect(mongoUri);

    const user = await resolveSeedUser();

    if (committeeNames.length < 1) {
      throw new Error('SEED_COMMITTEES must contain at least one committee name.');
    }

    const committees = await Promise.all(
      committeeNames.map((name, index) => seedCommittee(getCommitteeSeed(name, index))),
    );

    await InternshipApplication.deleteOne({
      userId: user.uuid,
      applicationCycle,
    });

    const firstChoiceCommittee = committees[0]?._id;
    const secondChoiceCommittee = committees[1]?._id || undefined;
    const thirdChoiceCommittee = committees[2]?._id || undefined;

    const baseApplication = {
      userId: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      university: 'UCLA',
      major: user.major,
      graduationYear: Number(process.env.SEED_GRADUATION_YEAR || 2027),
      firstChoiceCommittee,
      secondChoiceCommittee,
      thirdChoiceCommittee,
      firstChoiceResponses: [],
      secondChoiceResponses: [],
      thirdChoiceResponses: [],
      firstChoiceStatus: process.env.SEED_FIRST_STATUS || 'reviewing',
      secondChoiceStatus: process.env.SEED_SECOND_STATUS || 'pending',
      thirdChoiceStatus: process.env.SEED_THIRD_STATUS || 'interview_scheduled',
      applicationCycle,
      submissionStatus: applicationStatus,
      deletedAt: null,
      deletedBy: null,
      lastModifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (applicationStatus === 'submitted') {
      baseApplication.submittedAt = new Date();
    } else {
      baseApplication.submittedAt = null;
    }

    const application = await InternshipApplication.create(baseApplication);

    console.log(`Seeded internship test data for ${user.email} (${user.uuid})`);
    console.log(`- application cycle: ${applicationCycle}`);
    console.log(`- application status: ${applicationStatus}`);
    console.log(`- committees: ${committees.map((committee) => committee.displayName).join(', ')}`);
    console.log(`- application id: ${application._id}`);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
