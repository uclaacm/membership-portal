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
const applicationStatus = (process.env.SEED_STATUS || 'draft').toLowerCase();
const committeeNames = (process.env.SEED_COMMITTEES || 'Hack,AI,Design')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

const QUESTION_SETS_BY_SLUG = {
  ai: [
    {
      questionKey: 'ai_interest',
      questionText: 'What area of AI or machine learning are you most excited to explore with ACM AI?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'ai_experience',
      questionText: 'Tell us about a project, class, paper, or idea that shaped your interest in AI.',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'ai_track',
      questionText: 'Which ACM AI track sounds most interesting to you?',
      questionType: 'multiple_choice',
      choices: ['Research', 'Projects', 'Education', 'Outreach', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
  cyber: [
    {
      questionKey: 'cyber_interest',
      questionText: 'What part of cybersecurity are you most interested in learning more about?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'cyber_learning_style',
      questionText: 'Describe how you approach learning a new technical topic or solving an unfamiliar challenge.',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'cyber_focus',
      questionText: 'Which Cyber activity would you be most excited to help with?',
      questionType: 'multiple_choice',
      choices: ['Workshops', 'CTFs', 'Security projects', 'Community events', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
  design: [
    {
      questionKey: 'design_interest',
      questionText: 'Why are you interested in ACM Design?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'design_process',
      questionText: 'Describe a design, creative, or user experience problem you enjoyed thinking through.',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'design_role',
      questionText: 'Which type of Design work would you like to grow in?',
      questionType: 'multiple_choice',
      choices: ['Product design', 'Visual design', 'Design systems', 'Research', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
  hack: [
    {
      questionKey: 'hack_interest',
      questionText: 'What draws you to ACM Hack and building with others?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'hack_build',
      questionText: 'Tell us about something you have built or want to build.',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'hack_event',
      questionText: 'Which kind of Hack event would you be most excited to support?',
      questionType: 'multiple_choice',
      choices: ['Beginner workshops', 'Hack nights', 'Project showcases', 'Mentorship', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
  icpc: [
    {
      questionKey: 'icpc_interest',
      questionText: 'Why are you interested in ACM ICPC?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'icpc_problem_solving',
      questionText: 'Describe a problem-solving experience you enjoyed, technical or non-technical.',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'icpc_focus',
      questionText: 'Which ICPC area would you most like to participate in?',
      questionType: 'multiple_choice',
      choices: ['Competitive programming', 'Interview prep', 'Teaching algorithms', 'Community practice', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
  studio: [
    {
      questionKey: 'studio_interest',
      questionText: 'What interests you about games, interactive media, or ACM Studio?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'studio_creative_work',
      questionText: 'Tell us about a game, story, tool, artwork, or interactive experience that inspires you.',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'studio_role',
      questionText: 'Which Studio role would you most like to try?',
      questionType: 'multiple_choice',
      choices: ['Programming', 'Game design', 'Art', 'Audio', 'Production', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
  teachla: [
    {
      questionKey: 'teachla_interest',
      questionText: 'Why are you interested in teaching computer science with Teach LA?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'teachla_teaching',
      questionText: 'Describe a time you helped someone learn something new.',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'teachla_focus',
      questionText: 'Which Teach LA workstream sounds most interesting?',
      questionType: 'multiple_choice',
      choices: ['Curriculum', 'Classroom teaching', 'Developer tools', 'Outreach', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
  w: [
    {
      questionKey: 'w_interest',
      questionText: 'Why are you interested in ACM W?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'w_community',
      questionText: 'How would you like to help build community for women and gender minorities in tech?',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'w_programming',
      questionText: 'Which ACM W programming area are you most excited about?',
      questionType: 'multiple_choice',
      choices: ['Mentorship', 'Social events', 'Technical workshops', 'Industry events', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
  acmw: [
    {
      questionKey: 'w_interest',
      questionText: 'Why are you interested in ACM W?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'w_community',
      questionText: 'How would you like to help build community for women and gender minorities in tech?',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'w_programming',
      questionText: 'Which ACM W programming area are you most excited about?',
      questionType: 'multiple_choice',
      choices: ['Mentorship', 'Social events', 'Technical workshops', 'Industry events', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
  cloud: [
    {
      questionKey: 'cloud_interest',
      questionText: 'What interests you about cloud computing, infrastructure, or developer tools?',
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: 'cloud_project',
      questionText: 'Describe a technical system or product you would like to understand better.',
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: 'cloud_focus',
      questionText: 'Which Cloud topic sounds most interesting?',
      questionType: 'multiple_choice',
      choices: ['Web services', 'Infrastructure', 'DevOps', 'Databases', 'Still exploring'],
      required: true,
      order: 3,
    },
  ],
};

function slugifyCommitteeName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function getCustomQuestions(name) {
  const slug = slugifyCommitteeName(name) || 'committee';
  const knownQuestions = QUESTION_SETS_BY_SLUG[slug];

  if (knownQuestions) {
    return knownQuestions;
  }

  return [
    {
      questionKey: `${slug}_interest`,
      questionText: `Why are you interested in ${name}?`,
      questionType: 'long_text',
      required: true,
      order: 1,
    },
    {
      questionKey: `${slug}_experience`,
      questionText: `Tell us about an experience, project, or goal that connects to ${name}.`,
      questionType: 'long_text',
      required: true,
      order: 2,
    },
    {
      questionKey: `${slug}_contribution`,
      questionText: `How would you like to contribute to ${name} as an intern?`,
      questionType: 'long_text',
      required: true,
      order: 3,
    },
  ];
}

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
      customQuestions: getCustomQuestions(displayName),
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
