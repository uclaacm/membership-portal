jest.mock('../../app/api/v1/internship/models/InternshipApplication', () => ({
  InternshipApplication: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
  },
  getCurrentApplicationCycle: jest.fn(() => '2026-2027'),
}));

jest.mock('../../app/api/v1/internship/models/Committee', () => ({
  Committee: {
    findById: jest.fn(),
    find: jest.fn(),
  },
}));

const {
  InternshipApplication,
} = require('../../app/api/v1/internship/models/InternshipApplication');
const { Committee } = require('../../app/api/v1/internship/models/Committee');
const {
  updateApplicationStatus,
  getOwnApplication,
} = require('../../app/api/v1/internship/controllers/applicationController');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockUser({
  accessType = 'OFFICER',
  committees = ['dev'],
} = {}) {
  return {
    isAdmin: jest.fn(() => accessType === 'ADMIN'),
    isOfficer: jest.fn(() => accessType === 'OFFICER'),
    getDataValue: jest.fn((field) => {
      if (field === 'committees') {
        return committees;
      }
      return undefined;
    }),
  };
}

function mockApplication(overrides = {}) {
  return {
    _id: 'application-1',
    firstChoiceCommittee: 'committee-1',
    secondChoiceCommittee: 'committee-2',
    thirdChoiceCommittee: null,
    firstChoiceStatus: 'pending',
    secondChoiceStatus: 'pending',
    thirdChoiceStatus: 'pending',
    submissionStatus: 'submitted',
    deletedAt: null,
    ...overrides,
  };
}

function mockCommittee(overrides = {}) {
  return {
    _id: 'committee-1',
    id: 'committee-1',
    name: 'dev',
    displayName: 'ACM Dev',
    ...overrides,
  };
}

function mockCommitteeFindById(committee) {
  Committee.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(committee),
  });
}

describe('updateApplicationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updates only the requested status field for an officer assigned to the selected committee', async () => {
    const updatedApplication = mockApplication({ firstChoiceStatus: 'accepted' });
    InternshipApplication.findById.mockResolvedValue(mockApplication());
    InternshipApplication.findByIdAndUpdate.mockResolvedValue(updatedApplication);
    mockCommitteeFindById(mockCommittee());

    const req = {
      params: { id: 'application-1' },
      user: mockUser({ committees: ['Dev'] }),
      body: {
        statusField: 'firstChoiceStatus',
        status: 'accepted',
        firstName: 'Malicious Change',
      },
    };
    const res = mockResponse();

    await updateApplicationStatus(req, res);

    expect(InternshipApplication.findByIdAndUpdate).toHaveBeenCalledWith(
      'application-1',
      {
        firstChoiceStatus: 'accepted',
        lastModifiedAt: expect.any(Date),
      },
      { new: true, runValidators: true },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: updatedApplication,
    }));
  });

  test('prevents officers from updating a status for a committee they do not manage', async () => {
    InternshipApplication.findById.mockResolvedValue(mockApplication());
    mockCommitteeFindById(mockCommittee({ name: 'design', displayName: 'Design' }));

    const req = {
      params: { id: 'application-1' },
      user: mockUser({ committees: ['Dev'] }),
      body: {
        statusField: 'firstChoiceStatus',
        status: 'rejected',
      },
    };
    const res = mockResponse();

    await updateApplicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'You do not have permission to update first choice status',
    }));
    expect(InternshipApplication.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('prevents non-officer members from updating application status', async () => {
    InternshipApplication.findById.mockResolvedValue(mockApplication());
    mockCommitteeFindById(mockCommittee());

    const req = {
      params: { id: 'application-1' },
      user: mockUser({ accessType: 'STANDARD', committees: [] }),
      body: {
        statusField: 'firstChoiceStatus',
        status: 'accepted',
      },
    };
    const res = mockResponse();

    await updateApplicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'You do not have permission to update first choice status',
    }));
    expect(InternshipApplication.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('allows admins to update any committee choice status', async () => {
    const updatedApplication = mockApplication({ secondChoiceStatus: 'reviewing' });
    InternshipApplication.findById.mockResolvedValue(mockApplication());
    InternshipApplication.findByIdAndUpdate.mockResolvedValue(updatedApplication);
    mockCommitteeFindById(mockCommittee({ name: 'design', displayName: 'Design' }));

    const req = {
      params: { id: 'application-1' },
      user: mockUser({ accessType: 'ADMIN', committees: [] }),
      body: {
        statusField: 'secondChoiceStatus',
        status: 'reviewing',
      },
    };
    const res = mockResponse();

    await updateApplicationStatus(req, res);

    expect(InternshipApplication.findByIdAndUpdate).toHaveBeenCalledWith(
      'application-1',
      {
        secondChoiceStatus: 'reviewing',
        lastModifiedAt: expect.any(Date),
      },
      { new: true, runValidators: true },
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('rejects status updates for draft applications', async () => {
    InternshipApplication.findById.mockResolvedValue(mockApplication({
      submissionStatus: 'draft',
    }));

    const req = {
      params: { id: 'application-1' },
      user: mockUser(),
      body: {
        statusField: 'firstChoiceStatus',
        status: 'accepted',
      },
    };
    const res = mockResponse();

    await updateApplicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Application status can only be updated after submission',
    }));
    expect(InternshipApplication.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});

describe('getOwnApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockOwnApplication(application, releasedCommitteeIds) {
    InternshipApplication.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({ ...application, toObject: () => ({ ...application }) }),
    });
    Committee.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(releasedCommitteeIds.map((id) => ({ id }))),
    });
  }

  async function fetchOwn() {
    const res = mockResponse();
    await getOwnApplication({ user: { uuid: 'user-1' } }, res);
    return { res, data: res.json.mock.calls[0][0].data };
  }

  test('withholds statuses for committees that have not released decisions', async () => {
    mockOwnApplication(mockApplication({
      firstChoiceStatus: 'rejected',
      secondChoiceStatus: 'interview_scheduled',
    }), []);

    const { res, data } = await fetchOwn();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(data.firstChoiceStatus).toBeNull();
    expect(data.secondChoiceStatus).toBeNull();
    expect(data.thirdChoiceStatus).toBeNull();
  });

  test('shows the status only for committees that released, per committee', async () => {
    mockOwnApplication(mockApplication({
      firstChoiceStatus: 'accepted',
      secondChoiceStatus: 'rejected',
    }), ['committee-1']);

    const { data } = await fetchOwn();

    expect(Committee.find).toHaveBeenCalledWith({
      _id: { $in: ['committee-1', 'committee-2'] },
      decisionsReleased: true,
    });
    expect(data.firstChoiceStatus).toBe('accepted');
    expect(data.secondChoiceStatus).toBeNull();
  });
});
