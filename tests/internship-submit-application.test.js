jest.mock('../app/api/v1/internship/models/InternshipApplication', () => ({
  InternshipApplication: {
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  getCurrentApplicationCycle: jest.fn(() => '2026-2027'),
}));

jest.mock('../app/api/v1/internship/models/Committee', () => ({
  Committee: {
    find: jest.fn(),
  },
}));

const {
  InternshipApplication,
} = require('../app/api/v1/internship/models/InternshipApplication');
const { Committee } = require('../app/api/v1/internship/models/Committee');
const {
  submitApplication,
  updateApplication,
} = require('../app/api/v1/internship/controllers/applicationController');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockUser(uuid = 'owner-user') {
  return {
    uuid,
    isAdmin: jest.fn(() => false),
    isOfficer: jest.fn(() => false),
  };
}

function mockCommittee(overrides = {}) {
  return {
    _id: 'committee-1',
    id: 'committee-1',
    name: 'dev',
    displayName: 'ACM Dev',
    isActive: true,
    applicationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    customQuestions: [
      {
        questionKey: 'why-dev',
        questionText: 'Why Dev?',
        required: true,
      },
    ],
    ...overrides,
  };
}

function mockApplication(overrides = {}) {
  return {
    _id: 'application-1',
    userId: 'owner-user',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@g.ucla.edu',
    university: 'UCLA',
    major: 'Computer Science',
    graduationYear: 2027,
    firstChoiceCommittee: 'committee-1',
    firstChoiceResponses: [
      {
        questionKey: 'why-dev',
        question: 'Why Dev?',
        answer: 'I like building useful tools.',
      },
    ],
    secondChoiceCommittee: null,
    thirdChoiceCommittee: null,
    submissionStatus: 'draft',
    deletedAt: null,
    ...overrides,
  };
}

function mockCommitteeFind(committees) {
  Committee.find.mockReturnValue({
    select: jest.fn().mockResolvedValue(committees),
  });
}

describe('submitApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects submission from a non-owner', async () => {
    InternshipApplication.findById.mockResolvedValue(mockApplication());
    const req = {
      params: { id: 'application-1' },
      user: mockUser('other-user'),
    };
    const res = mockResponse();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'You do not have permission to submit this application',
    }));
    expect(InternshipApplication.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('rejects submission when a selected committee deadline has passed', async () => {
    InternshipApplication.findById.mockResolvedValue(mockApplication());
    mockCommitteeFind([
      mockCommittee({
        applicationDeadline: new Date(Date.now() - 60 * 1000),
      }),
    ]);
    const req = {
      params: { id: 'application-1' },
      user: mockUser(),
    };
    const res = mockResponse();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Application deadline has passed for: ACM Dev',
    }));
    expect(InternshipApplication.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('rejects submission when required committee answers are missing', async () => {
    InternshipApplication.findById.mockResolvedValue(mockApplication({
      firstChoiceResponses: [],
    }));
    mockCommitteeFind([mockCommittee()]);
    const req = {
      params: { id: 'application-1' },
      user: mockUser(),
    };
    const res = mockResponse();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Missing required fields: ACM Dev: Why Dev?',
      missingFields: ['ACM Dev: Why Dev?'],
    }));
    expect(InternshipApplication.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('prevents double submission', async () => {
    InternshipApplication.findById.mockResolvedValue(mockApplication({
      submissionStatus: 'submitted',
    }));
    const req = {
      params: { id: 'application-1' },
      user: mockUser(),
    };
    const res = mockResponse();

    await submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Application has already been submitted',
    }));
    expect(InternshipApplication.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('returns the updated submitted application with submittedAt', async () => {
    const updatedApplication = mockApplication({
      submissionStatus: 'submitted',
      submittedAt: new Date(),
    });
    InternshipApplication.findById.mockResolvedValue(mockApplication());
    InternshipApplication.findOneAndUpdate.mockResolvedValue(updatedApplication);
    mockCommitteeFind([mockCommittee()]);
    const req = {
      params: { id: 'application-1' },
      user: mockUser(),
    };
    const res = mockResponse();

    await submitApplication(req, res);

    expect(InternshipApplication.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: 'application-1',
        userId: 'owner-user',
        submissionStatus: 'draft',
        deletedAt: null,
      },
      expect.objectContaining({
        submissionStatus: 'submitted',
        submittedAt: expect.any(Date),
        lastModifiedAt: expect.any(Date),
      }),
      { new: true, runValidators: true },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: updatedApplication,
      message: 'Application submitted successfully',
    }));
  });
});

describe('updateApplication submitted locking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('prevents the owner from editing a submitted application', async () => {
    InternshipApplication.findById.mockResolvedValue(mockApplication({
      submissionStatus: 'submitted',
    }));
    const req = {
      params: { id: 'application-1' },
      user: mockUser(),
      body: { major: 'Math' },
    };
    const res = mockResponse();

    await updateApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'You cannot update a submitted application',
    }));
    expect(InternshipApplication.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
