jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  })),
}), { virtual: true });

jest.mock('../app/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
}));

jest.mock('../app/api/v1/internship/models/Committee', () => ({
  Committee: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('../app/api/v1/internship/models/InternshipApplication', () => ({
  InternshipApplication: {
    aggregate: jest.fn(),
  },
  getCurrentApplicationCycle: jest.fn(),
}));

const { Committee } = require('../app/api/v1/internship/models/Committee');
const { InternshipApplication } = require('../app/api/v1/internship/models/InternshipApplication');
const {
  updateCommitteeQuestions,
  updateCommitteeAdmin,
  getAllCommitteesAdmin,
} = require('../app/api/v1/internship/controllers/committeeController');
const { isAdmin } = require('../app/api/v1/auth');
const error = require('../app/error');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const adminUser = {
  isAdmin: () => true,
  isOfficer: () => false,
  hasCommittee: () => false,
};

const officerInHack = {
  isAdmin: () => false,
  isOfficer: () => true,
  hasCommittee: (c) => c === 'Hack',
};

const officerInAI = {
  isAdmin: () => false,
  isOfficer: () => true,
  hasCommittee: (c) => c === 'AI',
};

const sampleQuestions = [
  { questionKey: 'why', questionText: 'Why apply?', questionType: 'long_text' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('updateCommitteeQuestions (officer-scoped)', () => {
  test('admin can update questions on any committee and receives the updated doc', async () => {
    const committeeDoc = { _id: '1', name: 'Hack' };
    const updated = { _id: '1', name: 'Hack', customQuestions: sampleQuestions };
    Committee.findById.mockResolvedValue(committeeDoc);
    Committee.findByIdAndUpdate.mockResolvedValue(updated);

    const req = { params: { id: '1' }, user: adminUser, body: { customQuestions: sampleQuestions } };
    const res = mockRes();
    const next = jest.fn();

    await updateCommitteeQuestions(req, res, next);

    expect(Committee.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { $set: { customQuestions: sampleQuestions } },
      expect.objectContaining({ new: true, runValidators: true }),
    );
    expect(res.json).toHaveBeenCalledWith({ error: null, committee: updated });
    expect(next).not.toHaveBeenCalled();
  });

  test('officer assigned to the committee can update its questions', async () => {
    const committeeDoc = { _id: '1', name: 'Hack' };
    const updated = { _id: '1', name: 'Hack', customQuestions: sampleQuestions };
    Committee.findById.mockResolvedValue(committeeDoc);
    Committee.findByIdAndUpdate.mockResolvedValue(updated);

    const req = { params: { id: '1' }, user: officerInHack, body: { customQuestions: sampleQuestions } };
    const res = mockRes();
    const next = jest.fn();

    await updateCommitteeQuestions(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ error: null, committee: updated });
    expect(next).not.toHaveBeenCalled();
  });

  test('officer in a different committee is forbidden with a descriptive 403', async () => {
    Committee.findById.mockResolvedValue({ _id: '1', name: 'Hack' });

    const req = { params: { id: '1' }, user: officerInAI, body: { customQuestions: sampleQuestions } };
    const res = mockRes();
    const next = jest.fn();

    await updateCommitteeQuestions(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const passed = next.mock.calls[0][0];
    expect(passed).toBeInstanceOf(error.Forbidden);
    expect(passed.status).toBe(403);
    expect(passed.message).toMatch(/not assigned/i);
    expect(Committee.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('returns 404 when the committee does not exist', async () => {
    Committee.findById.mockResolvedValue(null);

    const req = { params: { id: 'missing' }, user: adminUser, body: { customQuestions: sampleQuestions } };
    const res = mockRes();
    const next = jest.fn();

    await updateCommitteeQuestions(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Committee not found' });
    expect(Committee.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('returns 400 when customQuestions is missing or not an array', async () => {
    Committee.findById.mockResolvedValue({ _id: '1', name: 'Hack' });

    const req = { params: { id: '1' }, user: adminUser, body: { notQuestions: 'oops' } };
    const res = mockRes();
    const next = jest.fn();

    await updateCommitteeQuestions(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const passed = next.mock.calls[0][0];
    expect(passed).toBeInstanceOf(error.BadRequest);
    expect(passed.status).toBe(400);
    expect(Committee.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('ignores attempts to change applicationDeadline, isActive, or other protected fields', async () => {
    const committeeDoc = { _id: '1', name: 'Hack' };
    const updated = { _id: '1', name: 'Hack', customQuestions: sampleQuestions };
    Committee.findById.mockResolvedValue(committeeDoc);
    Committee.findByIdAndUpdate.mockResolvedValue(updated);

    const req = {
      params: { id: '1' },
      user: adminUser,
      body: {
        customQuestions: sampleQuestions,
        applicationDeadline: new Date('2030-01-01'),
        isActive: false,
        name: 'get hacked nerd',
        internLimit: 999,
      },
    };
    const res = mockRes();
    const next = jest.fn();

    await updateCommitteeQuestions(req, res, next);

    expect(Committee.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    const [, updatePayload] = Committee.findByIdAndUpdate.mock.calls[0];
    expect(updatePayload).toEqual({ $set: { customQuestions: sampleQuestions } });
    expect(updatePayload.$set).not.toHaveProperty('applicationDeadline');
    expect(updatePayload.$set).not.toHaveProperty('isActive');
    expect(updatePayload.$set).not.toHaveProperty('name');
    expect(updatePayload.$set).not.toHaveProperty('internLimit');
    expect(next).not.toHaveBeenCalled();
  });
});

describe('updateCommitteeAdmin', () => {
  test('admin can update name, internLimit, isActive, and applicationDeadline together', async () => {
    const update = {
      name: 'ACM Hack',
      internLimit: 20,
      isActive: false,
      applicationDeadline: new Date('2026-4-20'),
    };
    const updated = { _id: '1', ...update };
    Committee.findByIdAndUpdate.mockResolvedValue(updated);

    const req = { params: { id: '1' }, user: adminUser, body: update };
    const res = mockRes();
    const next = jest.fn();

    await updateCommitteeAdmin(req, res, next);

    expect(Committee.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      update,
      expect.objectContaining({ new: true, runValidators: true }),
    );
    expect(res.json).toHaveBeenCalledWith({ error: null, committee: updated });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 404 when the committee does not exist', async () => {
    Committee.findByIdAndUpdate.mockResolvedValue(null);

    const req = { params: { id: 'missing' }, user: adminUser, body: { name: 'x' } };
    const res = mockRes();
    const next = jest.fn();

    await updateCommitteeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Committee not found' });
  });
});

describe('isAdmin middleware — gates PUT /committees/:id/admin', () => {
  test('admin is allowed through', () => {
    const next = jest.fn();
    isAdmin({ user: adminUser }, mockRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('officer (non-admin) is blocked with 403', () => {
    const next = jest.fn();
    isAdmin({ user: officerInHack }, mockRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
    const passed = next.mock.calls[0][0];
    expect(passed).toBeInstanceOf(error.Forbidden);
    expect(passed.status).toBe(403);
  });

  test('unauthenticated request (no req.user) is blocked with 403', () => {
    const next = jest.fn();
    isAdmin({}, mockRes(), next);
    const passed = next.mock.calls[0][0];
    expect(passed).toBeInstanceOf(error.Forbidden);
    expect(passed.status).toBe(403);
  });
});

describe('getAllCommitteesAdmin (applicationCount)', () => {
  // Mongoose chains .find().sort(); helper builds a chainable mock that resolves to `committees`.
  const mockFindSort = (committees) => {
    Committee.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(committees) });
  };

  // Each fixture committee.toObject() should return a plain copy without the toObject method
  // so it matches what the controller spreads into the response.
  const makeCommittee = (id, displayName, extra = {}) => ({
    _id: id,
    displayName,
    name: displayName.toLowerCase(),
    isActive: true,
    ...extra,
    toObject() {
      const { toObject, ...rest } = this;
      return rest;
    },
  });

  test('attaches applicationCount from aggregation, defaulting missing committees to 0', async () => {
    const committees = [
      makeCommittee('c1', 'Hack'),
      makeCommittee('c2', 'AI'),
      makeCommittee('c3', 'Studio'),
    ];
    mockFindSort(committees);
    InternshipApplication.aggregate.mockResolvedValue([
      { _id: { toString: () => 'c1' }, count: 5 },
      { _id: { toString: () => 'c2' }, count: 2 },
      // c3 absent → should default to 0
    ]);

    const req = { user: adminUser };
    const res = mockRes();
    const next = jest.fn();

    await getAllCommitteesAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledTimes(1);
    const payload = res.json.mock.calls[0][0];
    expect(payload.error).toBeNull();
    expect(payload.committees).toHaveLength(3);
    const byId = Object.fromEntries(payload.committees.map((c) => [c._id, c]));
    expect(byId.c1.applicationCount).toBe(5);
    expect(byId.c2.applicationCount).toBe(2);
    expect(byId.c3.applicationCount).toBe(0);
  });

  test('aggregation pipeline filters to submitted, non-deleted apps and dedupes choice slots', async () => {
    mockFindSort([]);
    InternshipApplication.aggregate.mockResolvedValue([]);

    await getAllCommitteesAdmin({ user: adminUser }, mockRes(), jest.fn());

    expect(InternshipApplication.aggregate).toHaveBeenCalledTimes(1);
    const pipeline = InternshipApplication.aggregate.mock.calls[0][0];
    expect(pipeline[0]).toEqual({
      $match: { deletedAt: null, submissionStatus: 'submitted' },
    });
    // $setUnion across the three choice fields ensures one application doesn't double-count
    // a committee selected in multiple slots.
    const projectStage = pipeline.find((s) => s.$project);
    expect(projectStage.$project.committees.$setUnion).toBeDefined();
    expect(pipeline.some((s) => s.$unwind === '$committees')).toBe(true);
    expect(pipeline.some((s) => s.$group && s.$group._id === '$committees')).toBe(true);
  });

  test('returns 0 counts for every committee when there are no applications', async () => {
    const committees = [makeCommittee('c1', 'Hack'), makeCommittee('c2', 'AI')];
    mockFindSort(committees);
    InternshipApplication.aggregate.mockResolvedValue([]);

    const res = mockRes();
    await getAllCommitteesAdmin({ user: adminUser }, res, jest.fn());

    const payload = res.json.mock.calls[0][0];
    expect(payload.committees.map((c) => c.applicationCount)).toEqual([0, 0]);
  });

  test('forwards aggregation errors to next() instead of throwing', async () => {
    mockFindSort([]);
    const boom = new Error('mongo down');
    InternshipApplication.aggregate.mockRejectedValue(boom);

    const next = jest.fn();
    await getAllCommitteesAdmin({ user: adminUser }, mockRes(), next);

    expect(next).toHaveBeenCalledWith(boom);
  });
});
