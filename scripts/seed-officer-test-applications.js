require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');

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

const targetCommitteeName = process.argv[2] || process.env.SEED_OFFICER_COMMITTEE || 'ICPC';
const applicationCycle = process.env.SEED_APPLICATION_CYCLE || getCurrentApplicationCycle();

const STATUS_OPTIONS = ['pending', 'reviewing', 'interview_scheduled', 'accepted', 'rejected'];
const MAJORS = ['Computer Science', 'Computer Science and Engineering', 'Electrical Engineering', 'Statistics and Data Science', 'Mathematics', 'Cognitive Science'];
const FIRST_NAMES = ['Ava', 'Noah', 'Mia', 'Liam', 'Zoe', 'Ethan', 'Priya', 'Kai', 'Luna', 'Omar', 'Sofia', 'Jax', 'Nina', 'Theo', 'Ruby'];
const LAST_NAMES = ['Nguyen', 'Patel', 'Kim', 'Garcia', 'Chen', 'Okafor', 'Rossi', 'Park', 'Ivanov', 'Silva', 'Haddad', 'Tanaka', 'Fischer', 'Reyes', 'Novak'];

const APPLICANT_COUNT = 15;

function pick(arr, index) {
  return arr[index % arr.length];
}

function buildApplicant(index, targetCommitteeId, otherCommitteeIds) {
  const firstName = pick(FIRST_NAMES, index);
  const lastName = pick(LAST_NAMES, index);
  const status = pick(STATUS_OPTIONS, index);
  // Spread the target committee across 1st/2nd/3rd choice so the officer
  // dashboard's choice-rank filter has data to filter against.
  const rank = (index % 3) + 1;

  const choiceCommittees = [null, null, null];
  choiceCommittees[rank - 1] = targetCommitteeId;

  const remainingSlots = [0, 1, 2].filter((slot) => slot !== rank - 1);
  remainingSlots.forEach((slot, i) => {
    if (otherCommitteeIds[i]) {
      choiceCommittees[slot] = otherCommitteeIds[i];
    }
  });

  const choiceStatuses = ['pending', 'pending', 'pending'];
  choiceStatuses[rank - 1] = status;

  return {
    userId: `officer-test-applicant-${index}`,
    firstName,
    lastName,
    email: `officer.test.applicant${index}@g.ucla.edu`,
    university: 'UCLA',
    major: pick(MAJORS, index),
    graduationYear: 2026 + (index % 4),
    firstChoiceCommittee: choiceCommittees[0] || undefined,
    secondChoiceCommittee: choiceCommittees[1] || undefined,
    thirdChoiceCommittee: choiceCommittees[2] || undefined,
    firstChoiceResponses: [],
    secondChoiceResponses: [],
    thirdChoiceResponses: [],
    firstChoiceStatus: choiceStatuses[0],
    secondChoiceStatus: choiceStatuses[1],
    thirdChoiceStatus: choiceStatuses[2],
    applicationCycle,
    submissionStatus: 'submitted',
    submittedAt: new Date(),
    lastModifiedAt: new Date(),
  };
}

async function main() {
  await mongoose.connect(mongoUri);

  const targetCommittee = await Committee.findOne({
    $or: [{ name: targetCommitteeName }, { displayName: targetCommitteeName }],
  });

  if (!targetCommittee) {
    throw new Error(
      `Committee "${targetCommitteeName}" not found. Run "make seed-internship-test-data" first, `
      + 'or pass an existing committee name as the first argument.',
    );
  }

  const otherCommittees = await Committee.find({ _id: { $ne: targetCommittee.id } }).limit(2);
  const otherCommitteeIds = otherCommittees.map((committee) => committee.id);

  await InternshipApplication.deleteMany({ userId: /^officer-test-applicant-/ });

  const applicants = Array.from({ length: APPLICANT_COUNT }, (_, index) => (
    buildApplicant(index, targetCommittee.id, otherCommitteeIds)
  ));

  const created = await InternshipApplication.insertMany(applicants);

  const byStatus = STATUS_OPTIONS.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
  const byRank = { 1: 0, 2: 0, 3: 0 };
  created.forEach((application) => {
    const choices = [
      [application.firstChoiceCommittee, application.firstChoiceStatus],
      [application.secondChoiceCommittee, application.secondChoiceStatus],
      [application.thirdChoiceCommittee, application.thirdChoiceStatus],
    ];
    choices.forEach(([committeeId, status], slot) => {
      if (committeeId && committeeId.toString() === targetCommittee.id.toString()) {
        byStatus[status] += 1;
        byRank[slot + 1] += 1;
      }
    });
  });

  console.log(`Seeded ${created.length} submitted test applications for ${targetCommittee.displayName}`);
  console.log(`- application cycle: ${applicationCycle}`);
  console.log(`- by status: ${JSON.stringify(byStatus)}`);
  console.log(`- by choice rank: ${JSON.stringify(byRank)}`);
}

main()
  .then(() => mongoose.disconnect())
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
