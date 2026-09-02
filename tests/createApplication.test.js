jest.mock('../app/api/v1/internship/models/InternshipApplication', () => {
  const mockSave = jest.fn().mockImplementation(function save() {
    return Promise.resolve(this);
  });
  function MockInternshipApplication(data) {
    Object.assign(this, data);
    this.save = mockSave;
  }
  MockInternshipApplication.findOne = jest.fn();
  return {
    InternshipApplication: MockInternshipApplication,
    getCurrentApplicationCycle: jest.fn(() => '2026-2027'),
    __mockSave: mockSave,
  };
});

jest.mock('../app/api/v1/internship/models/Committee', () => ({
  Committee: {
    find: jest.fn(),
  },
}));

const {
  InternshipApplication,
  __mockSave: mockSave,
} = require('../app/api/v1/internship/models/InternshipApplication');
const { Committee } = require('../app/api/v1/internship/models/Committee');
const { createApplication } = require('../app/api/v1/internship/controllers/applicationController');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockUser() {
  return {
    uuid: 'owner-user',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@g.ucla.edu',
  };
}

function mockCommitteeFind(committees) {
  Committee.find.mockReturnValue({
    select: jest.fn().mockResolvedValue(committees),
  });
}

describe('createApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    InternshipApplication.findOne.mockResolvedValue(null);
  });

  test('builds the document from an allowlist, ignoring reviewer-only fields sent by the client', async () => {
    mockCommitteeFind([{
      id: 'committee-1',
      isActive: true,
      applicationDeadline: null,
      displayName: 'ACM Dev',
      name: 'dev',
    }]);
    const req = {
      user: mockUser(),
      body: {
        university: 'UCLA',
        major: 'Computer Science',
        graduationYear: 2027,
        firstChoiceCommittee: 'committee-1',
        // An attacker (or a buggy client) trying to pre-seed a fabricated
        // positive review before any officer has looked at the application.
        firstChoiceOfficer1Rating: 'yes',
        firstChoiceOfficer2Rating: 'yes',
        firstChoiceNotes: 'Already vetted, hire immediately',
        firstChoiceStatus: 'accepted',
        userId: 'attacker-controlled-uuid',
        deletedAt: new Date(),
      },
    };
    const res = mockResponse();

    await createApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const savedDoc = mockSave.mock.instances[0];
    expect(savedDoc.firstChoiceOfficer1Rating).toBeUndefined();
    expect(savedDoc.firstChoiceOfficer2Rating).toBeUndefined();
    expect(savedDoc.firstChoiceNotes).toBeUndefined();
    expect(savedDoc.firstChoiceStatus).toBeUndefined();
    expect(savedDoc.deletedAt).toBeUndefined();
    // userId is still set — just from the authenticated user, not the body.
    expect(savedDoc.userId).toBe('owner-user');
    expect(savedDoc.major).toBe('Computer Science');
    expect(savedDoc.submissionStatus).toBe('draft');
  });

  test('rejects when the applicant already has an application for the current cycle', async () => {
    InternshipApplication.findOne.mockResolvedValue({ _id: 'existing-app' });
    const req = {
      user: mockUser(),
      body: { university: 'UCLA', major: 'CS', graduationYear: 2027 },
    };
    const res = mockResponse();

    await createApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(mockSave).not.toHaveBeenCalled();
  });
});
