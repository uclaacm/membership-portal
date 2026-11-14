jest.mock('../../app/api/v1/internship/models/InternshipApplication', () => ({
  InternshipApplication: {
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
  getCurrentApplicationCycle: jest.fn(() => '2026-2027'),
}));

jest.mock('../../app/api/v1/internship/models/Committee', () => ({
  Committee: {
    find: jest.fn(),
  },
}));

const { submitApplication } = require('../../app/api/v1/internship/controllers/applicationController');
const { InternshipApplication } = require('../../app/api/v1/internship/models/InternshipApplication');
const { Committee } = require('../../app/api/v1/internship/models/Committee');

const OWNER_UUID = 'owner-uuid';
const APPLICATION_ID = 'app-1';
const FIRST_COMMITTEE_ID = 'cmt-first';
const SECOND_COMMITTEE_ID = 'cmt-second';

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function buildApplication(overrides = {}) {
  return {
    _id: APPLICATION_ID,
    userId: OWNER_UUID,
    submissionStatus: 'draft',
    resumeUrl: 'https://example.com/resume.pdf',
    firstChoiceCommittee: FIRST_COMMITTEE_ID,
    secondChoiceCommittee: null,
    thirdChoiceCommittee: null,
    firstChoiceResponses: [{ questionKey: 'why', answer: 'Because I love it' }],
    secondChoiceResponses: [],
    thirdChoiceResponses: [],
    deletedAt: null,
    ...overrides,
  };
}

function buildCommittee(id, overrides = {}) {
  return {
    _id: id,
    id,
    name: id,
    isActive: true,
    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    customQuestions: [
      { questionKey: 'why', questionText: 'Why?', required: true },
    ],
    ...overrides,
  };
}

// The controller calls Committee.find(...).select(...), so find must return an object with select.
function mockCommitteeFind(committees) {
  Committee.find.mockReturnValue({
    select: jest.fn().mockResolvedValue(committees),
  });
}

const buildReq = () => ({ params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } });

describe('submitApplication controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects with 404 when application does not exist', async () => {
    InternshipApplication.findById.mockResolvedValue(null);
    const res = mockRes();

    await submitApplication(buildReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Application not found',
    }));
    expect(InternshipApplication.findOneAndUpdate).not.toHaveBeenCalled();
  });

  // A deletion mark no longer hides an application. It used to 404 here while still holding
  // the applicant's one-per-cycle slot, which locked them out of ever applying again.
  test('submits an application carrying a deletion mark instead of returning 404', async () => {
    InternshipApplication.findById.mockResolvedValue(
      buildApplication({ deletedAt: new Date() }),
    );
    InternshipApplication.findOneAndUpdate.mockResolvedValue(
      buildApplication({ submissionStatus: 'submitted' }),
    );
    mockCommitteeFind([buildCommittee(FIRST_COMMITTEE_ID)]);
    const res = mockRes();

    await submitApplication(buildReq(), res);

    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('rejects with 400 when no committee is selected', async () => {
    InternshipApplication.findById.mockResolvedValue(
      buildApplication({ firstChoiceCommittee: null }),
    );
    const res = mockRes();

    await submitApplication(buildReq(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Application must include at least one committee selection',
    }));
    expect(InternshipApplication.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('rejects with 400 when a selected committee is inactive', async () => {
    InternshipApplication.findById.mockResolvedValue(buildApplication());
    mockCommitteeFind([buildCommittee(FIRST_COMMITTEE_ID, { isActive: false })]);
    const res = mockRes();

    await submitApplication(buildReq(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'first choice committee is no longer accepting applications',
    }));
    expect(InternshipApplication.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('treats a whitespace-only answer to a required question as missing', async () => {
    InternshipApplication.findById.mockResolvedValue(
      buildApplication({ firstChoiceResponses: [{ questionKey: 'why', answer: '   ' }] }),
    );
    mockCommitteeFind([buildCommittee(FIRST_COMMITTEE_ID)]);
    const res = mockRes();

    await submitApplication(buildReq(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: `Missing required fields: ${FIRST_COMMITTEE_ID}: Why?`,
      missingFields: [`${FIRST_COMMITTEE_ID}: Why?`],
    }));
    expect(InternshipApplication.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('validates every selected committee, not only the first', async () => {
    InternshipApplication.findById.mockResolvedValue(buildApplication({
      secondChoiceCommittee: SECOND_COMMITTEE_ID,
      secondChoiceResponses: [{ questionKey: 'why', answer: 'ok' }],
    }));
    mockCommitteeFind([
      buildCommittee(FIRST_COMMITTEE_ID),
      buildCommittee(SECOND_COMMITTEE_ID, { isActive: false }),
    ]);
    const res = mockRes();

    await submitApplication(buildReq(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'second choice committee is no longer accepting applications',
    }));
    expect(InternshipApplication.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
