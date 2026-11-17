jest.mock('../../app/logger', () => ({
  info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), log: jest.fn(),
}));
jest.mock('../../app/db', () => ({
  User: { findAll: jest.fn() },
  AuditLog: { create: jest.fn() },
}));
jest.mock('../../app/audit', () => ({ recordAudit: jest.fn() }));
jest.mock('../../app/api/v1/internship/models/Committee', () => ({
  Committee: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));
jest.mock('../../app/api/v1/internship/models/InternshipApplication', () => ({
  InternshipApplication: { find: jest.fn().mockResolvedValue([]) },
  getCurrentApplicationCycle: jest.fn(),
}));

const mongoose = require('mongoose');
const { User } = require('../../app/db');
const { Committee } = require('../../app/api/v1/internship/models/Committee');
const { getAllCommittees, deleteCommittee } = require('../../app/api/v1/internship/controllers/committeeController');
const { findUnknownCommittees } = require('../../app/committees');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const sortedQuery = (result) => ({
  select: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(result) }),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllCommittees', () => {
  test('an officer gets their own committee back even while it is inactive', async () => {
    Committee.find.mockReturnValue(sortedQuery([]));
    const req = {
      query: { includeInactive: 'true' },
      user: { isAdmin: () => false, isOfficer: () => true, committees: ['W'] },
    };

    await getAllCommittees(req, mockRes(), jest.fn());

    expect(Committee.find).toHaveBeenCalledWith({
      $or: [{ isActive: true }, { name: { $in: ['W'] } }],
    });
  });

  test('an admin gets every committee', async () => {
    Committee.find.mockReturnValue(sortedQuery([]));
    const req = { query: { includeInactive: 'true' }, user: { isAdmin: () => true, isOfficer: () => false } };

    await getAllCommittees(req, mockRes(), jest.fn());

    expect(Committee.find).toHaveBeenCalledWith({});
  });

  test('a member only gets active committees, even asking for inactive ones', async () => {
    Committee.find.mockReturnValue(sortedQuery([]));
    const req = { query: { includeInactive: 'true' }, user: { isAdmin: () => false, isOfficer: () => false } };

    await getAllCommittees(req, mockRes(), jest.fn());

    expect(Committee.find).toHaveBeenCalledWith({ isActive: true });
  });
});

describe('deleteCommittee', () => {
  const makeUser = (accessType, committees) => ({
    accessType,
    committees,
    isOfficer: () => accessType === 'OFFICER',
    isAdmin: () => accessType === 'ADMIN',
    update: jest.fn().mockResolvedValue(),
  });

  test('removes the committee from users and demotes officers left with none', async () => {
    Committee.findById.mockResolvedValue({ _id: 'c1', name: 'W', displayName: 'W' });
    const soleOfficer = makeUser('OFFICER', ['W']);
    const multiOfficer = makeUser('OFFICER', ['W', 'AI']);
    const admin = makeUser('ADMIN', ['W']);
    User.findAll.mockResolvedValue([soleOfficer, multiOfficer, admin]);

    const res = mockRes();
    const next = jest.fn();
    await deleteCommittee({ params: { id: 'c1' }, user: {} }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(User.findAll).toHaveBeenCalledWith({ where: { committees: { $contains: ['W'] } } });
    expect(soleOfficer.update).toHaveBeenCalledWith(expect.objectContaining({
      committees: [], accessType: 'STANDARD',
    }));
    expect(multiOfficer.update).toHaveBeenCalledWith({ committees: ['AI'] });
    expect(admin.update).toHaveBeenCalledWith({ committees: [] });
    expect(Committee.findByIdAndDelete).toHaveBeenCalledWith('c1');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ updatedUsers: 3, demotedOfficers: 1 }),
    );
  });
});

describe('findUnknownCommittees', () => {
  const originalState = mongoose.connection.readyState;
  afterEach(() => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: originalState, configurable: true });
  });

  test('checks names against the Committee collection', async () => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });
    const names = ['W', 'Dev Team', 'Board (JEDI)'];
    Committee.find.mockReturnValue({ distinct: jest.fn().mockResolvedValue(names) });

    await expect(findUnknownCommittees(['W', 'Board (JEDI)', 'Dev'])).resolves.toEqual(['Dev']);
  });

  test('refuses to validate rather than guessing when Mongo is down', async () => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

    await expect(findUnknownCommittees(['W'])).rejects.toThrow(/unavailable/);
  });
});
