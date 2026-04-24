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
  },
}));

const { Committee } = require('../app/api/v1/internship/models/Committee');
const {
  updateCommitteeQuestions,
  updateCommitteeAdmin,
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
