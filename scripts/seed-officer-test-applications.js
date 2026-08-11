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
let applicationCycle;

const STATUS_OPTIONS = ['pending', 'reviewing', 'interview_scheduled', 'accepted', 'rejected'];
const MAJORS = ['Computer Science', 'Computer Science and Engineering', 'Electrical Engineering', 'Statistics and Data Science', 'Mathematics', 'Cognitive Science'];
const FIRST_NAMES = ['Ava', 'Noah', 'Mia', 'Liam', 'Zoe', 'Ethan', 'Priya', 'Kai', 'Luna', 'Omar', 'Sofia', 'Jax', 'Nina', 'Theo', 'Ruby'];
const LAST_NAMES = ['Nguyen', 'Patel', 'Kim', 'Garcia', 'Chen', 'Okafor', 'Rossi', 'Park', 'Ivanov', 'Silva', 'Haddad', 'Tanaka', 'Fischer', 'Reyes', 'Novak'];

const APPLICANT_COUNT = 15;

function pick(arr, index) {
  return arr[index % arr.length];
}

// Build a real response for each of a committee's actual custom questions, so
// the officer dashboard's answer drawer and the backend's per-committee
// scrubbing both have real content to show/hide instead of empty arrays.
function buildResponses(committee, index) {
  if (!committee || !Array.isArray(committee.customQuestions)) return [];

  return committee.customQuestions.map((question, qIndex) => {
    let answer;
    if (question.questionType === 'multiple_choice' && Array.isArray(question.choices) && question.choices.length > 0) {
      answer = pick(question.choices, index + qIndex);
    } else {
      answer = `Applicant ${index} response to "${question.questionText}" — sample answer for testing purposes.`;
    }
    return { questionKey: question.questionKey, question: question.questionText, answer };
  });
}

const LONG_NOTE = 'Candidate showed strong problem-solving skills during the technical portion of the '
  + 'interview, communicated their thought process clearly, and asked thoughtful clarifying '
  + 'questions. Slightly less confident when discussing team collaboration experience, but '
  + 'overall a promising applicant who would likely ramp up quickly.';

// Vary officer ratings/notes so the dashboard has a mix of unrated, partially
// rated, and fully rated rows (including a "maybe") — including one
// long-note case to exercise the notes column's read-more/truncation
// behavior.
function buildReviewFields(index) {
  const variant = index % 5;
  if (variant === 1) return { officer1Rating: 'yes', officer2Rating: null, notes: 'Solid answers, worth a follow-up.' };
  if (variant === 2) return { officer1Rating: 'yes', officer2Rating: 'yes', notes: LONG_NOTE };
  if (variant === 3) return { officer1Rating: 'no', officer2Rating: 'no', notes: '' };
  if (variant === 4) return { officer1Rating: 'maybe', officer2Rating: 'yes', notes: 'Undecided — want to compare against the rest of the pool first.' };
  return { officer1Rating: null, officer2Rating: null, notes: '' };
}

function buildApplicant(index, targetCommittee, otherCommittees) {
  const firstName = pick(FIRST_NAMES, index);
  const lastName = pick(LAST_NAMES, index);
  const status = pick(STATUS_OPTIONS, index);
  // Spread the target committee across 1st/2nd/3rd choice so the officer
  // dashboard's choice-rank filter has data to filter against.
  const rank = (index % 3) + 1;

  const choiceCommittees = [null, null, null];
  choiceCommittees[rank - 1] = targetCommittee;

  const remainingSlots = [0, 1, 2].filter((slot) => slot !== rank - 1);
  remainingSlots.forEach((slot, i) => {
    if (otherCommittees[i]) {
      choiceCommittees[slot] = otherCommittees[i];
    }
  });

  const choiceStatuses = ['pending', 'pending', 'pending'];
  choiceStatuses[rank - 1] = status;

  const choiceResponses = choiceCommittees.map((committee) => buildResponses(committee, index));

  // Officer review fields only make sense on the target committee's own
  // slot — that's the only slot this seed run's officer would be reviewing.
  const officer1Ratings = [null, null, null];
  const officer2Ratings = [null, null, null];
  const notes = ['', '', ''];
  const reviewFields = buildReviewFields(index);
  officer1Ratings[rank - 1] = reviewFields.officer1Rating;
  officer2Ratings[rank - 1] = reviewFields.officer2Rating;
  notes[rank - 1] = reviewFields.notes;

  return {
    userId: `officer-test-applicant-${index}`,
    firstName,
    lastName,
    email: `officer.test.applicant${index}@g.ucla.edu`,
    university: 'UCLA',
    major: pick(MAJORS, index),
    graduationYear: 2026 + (index % 4),
    resumeUrl: `https://example.com/resumes/officer-test-applicant-${index}.pdf`,
    coverLetter: `This is a placeholder cover letter for test applicant ${index}, generated by the officer test-data seed script.`,
    firstChoiceCommittee: (choiceCommittees[0] && choiceCommittees[0].id) || undefined,
    secondChoiceCommittee: (choiceCommittees[1] && choiceCommittees[1].id) || undefined,
    thirdChoiceCommittee: (choiceCommittees[2] && choiceCommittees[2].id) || undefined,
    firstChoiceResponses: choiceResponses[0],
    secondChoiceResponses: choiceResponses[1],
    thirdChoiceResponses: choiceResponses[2],
    firstChoiceStatus: choiceStatuses[0],
    secondChoiceStatus: choiceStatuses[1],
    thirdChoiceStatus: choiceStatuses[2],
    firstChoiceOfficer1Rating: officer1Ratings[0],
    secondChoiceOfficer1Rating: officer1Ratings[1],
    thirdChoiceOfficer1Rating: officer1Ratings[2],
    firstChoiceOfficer2Rating: officer2Ratings[0],
    secondChoiceOfficer2Rating: officer2Ratings[1],
    thirdChoiceOfficer2Rating: officer2Ratings[2],
    firstChoiceNotes: notes[0],
    secondChoiceNotes: notes[1],
    thirdChoiceNotes: notes[2],
    applicationCycle,
    submissionStatus: 'submitted',
    submittedAt: new Date(),
    lastModifiedAt: new Date(),
  };
}

async function main() {
  await mongoose.connect(mongoUri);

  applicationCycle = process.env.SEED_APPLICATION_CYCLE || await getCurrentApplicationCycle();

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

  await InternshipApplication.deleteMany({ userId: /^officer-test-applicant-/ });

  const applicants = Array.from({ length: APPLICANT_COUNT }, (_, index) => (
    buildApplicant(index, targetCommittee, otherCommittees)
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
