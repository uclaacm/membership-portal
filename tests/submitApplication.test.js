jest.mock('../app/api/v1/internship/models/InternshipApplication', () => ({
  InternshipApplication: {
    findById: jest.fn(),
  },
  getCurrentApplicationCycle: jest.fn(() => '2026-2027'),
}));

jest.mock('../app/api/v1/internship/models/Committee', () => ({
  Committee: {
    find: jest.fn(),
  },
}));

const { submitApplication } = require('../app/api/v1/internship/controllers/applicationController');
const { InternshipApplication } = require('../app/api/v1/internship/models/InternshipApplication');
const { Committee } = require('../app/api/v1/internship/models/Committee');

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
  const app = {
    _id: APPLICATION_ID,
    userId: OWNER_UUID,
    submissionStatus: 'draft',
    firstChoiceCommittee: { toString: () => FIRST_COMMITTEE_ID },
    secondChoiceCommittee: null,
    thirdChoiceCommittee: null,
    firstChoiceResponses: [{ questionKey: 'why', answer: 'Because I love it' }],
    secondChoiceResponses: [],
    thirdChoiceResponses: [],
    save: jest.fn().mockImplementation(async function save() { return this; }),
    ...overrides,
  };
  return app;
}

function buildCommittee(id, overrides = {}) {
  return {
    _id: { toString: () => id },
    isActive: true,
    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    customQuestions: [
      { questionKey: 'why', questionText: 'Why?', required: true },
    ],
    ...overrides,
  };
}

describe('submitApplication controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects with 404 when application does not exist', async () => {
    InternshipApplication.findById.mockResolvedValue(null);
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('rejects with 404 when application is soft-deleted', async () => {
    InternshipApplication.findById.mockResolvedValue(
      buildApplication({ deletedAt: new Date() }),
    );
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('rejects with 403 when caller does not own the application', async () => {
    InternshipApplication.findById.mockResolvedValue(buildApplication({ userId: 'someone-else' }));
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('rejects with 409 when application is already submitted', async () => {
    InternshipApplication.findById.mockResolvedValue(
      buildApplication({ submissionStatus: 'submitted' }),
    );
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('rejects with 400 when no committee is selected', async () => {
    InternshipApplication.findById.mockResolvedValue(
      buildApplication({ firstChoiceCommittee: null }),
    );
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects with 400 when a selected committee is inactive', async () => {
    InternshipApplication.findById.mockResolvedValue(buildApplication());
    Committee.find.mockResolvedValue([
      buildCommittee(FIRST_COMMITTEE_ID, { isActive: false }),
    ]);
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/no longer accepting/i) }),
    );
  });

  test('rejects with 400 when a committee deadline has passed', async () => {
    InternshipApplication.findById.mockResolvedValue(buildApplication());
    Committee.find.mockResolvedValue([
      buildCommittee(FIRST_COMMITTEE_ID, {
        applicationDeadline: new Date(Date.now() - 60 * 1000),
      }),
    ]);
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/deadline has passed/i) }),
    );
  });

  test('rejects with 400 when required question is missing an answer', async () => {
    InternshipApplication.findById.mockResolvedValue(
      buildApplication({ firstChoiceResponses: [{ questionKey: 'why', answer: '   ' }] }),
    );
    Committee.find.mockResolvedValue([buildCommittee(FIRST_COMMITTEE_ID)]);
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/missing required answers/i) }),
    );
  });

  test('rejects when a required answer is omitted entirely', async () => {
    InternshipApplication.findById.mockResolvedValue(
      buildApplication({ firstChoiceResponses: [] }),
    );
    Committee.find.mockResolvedValue([buildCommittee(FIRST_COMMITTEE_ID)]);
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('validates every selected committee, not only the first', async () => {
    InternshipApplication.findById.mockResolvedValue(buildApplication({
      secondChoiceCommittee: { toString: () => SECOND_COMMITTEE_ID },
      secondChoiceResponses: [{ questionKey: 'why', answer: 'ok' }],
    }));
    Committee.find.mockResolvedValue([
      buildCommittee(FIRST_COMMITTEE_ID),
      buildCommittee(SECOND_COMMITTEE_ID, { isActive: false }),
    ]);
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/second choice/i) }),
    );
  });

  test('transitions to submitted and stamps submittedAt when all guards pass', async () => {
    const application = buildApplication();
    InternshipApplication.findById.mockResolvedValue(application);
    Committee.find.mockResolvedValue([buildCommittee(FIRST_COMMITTEE_ID)]);
    const req = { params: { id: APPLICATION_ID }, user: { uuid: OWNER_UUID } };
    const res = mockRes();

    const before = Date.now();
    await submitApplication(req, res);
    const after = Date.now();

    expect(application.submissionStatus).toBe('submitted');
    expect(application.submittedAt).toBeGreaterThanOrEqual(before);
    expect(application.submittedAt).toBeLessThanOrEqual(after);
    expect(application.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: application });
  });

});
