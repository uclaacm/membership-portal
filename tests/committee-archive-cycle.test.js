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
    find: jest.fn(),
  },
}));

jest.mock('../app/api/v1/internship/models/InternshipApplication', () => ({
  InternshipApplication: {
    updateMany: jest.fn(),
    distinct: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
  getCurrentApplicationCycle: jest.fn(),
}));

jest.mock('../app/api/v1/internship/models/InternshipSettings', () => ({
  computeDefaultCycleLabel: jest.fn(() => '2099-2100'),
  getCurrentCycle: jest.fn(),
  setCurrentCycle: jest.fn(),
}));

const { Committee } = require('../app/api/v1/internship/models/Committee');
const { InternshipApplication } = require('../app/api/v1/internship/models/InternshipApplication');
const { getCurrentCycle, setCurrentCycle } = require('../app/api/v1/internship/models/InternshipSettings');
const { getCycleInfo, advanceCycle } = require('../app/api/v1/internship/controllers/cycleController');
const { getAllApplications, getApplicationStatusCounts } = require('../app/api/v1/internship/controllers/applicationController');
const error = require('../app/error');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const adminUser = {
  uuid: 'admin-uuid',
  isAdmin: () => true,
  isOfficer: () => false,
  hasCommittee: () => false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getCycleInfo', () => {
  test('returns current cycle, past cycles (excluding current), and a suggested next cycle', async () => {
    getCurrentCycle.mockResolvedValue('2026-2027');
    InternshipApplication.distinct.mockResolvedValue(['2024-2025', '2025-2026']);

    const res = mockRes();
    await getCycleInfo({ user: adminUser }, res, jest.fn());

    expect(InternshipApplication.distinct).toHaveBeenCalledWith('applicationCycle', {
      applicationCycle: { $ne: '2026-2027' },
    });
    expect(res.json).toHaveBeenCalledWith({
      error: null,
      currentCycle: '2026-2027',
      suggestedNextCycle: '2027-2028',
      pastCycles: ['2024-2025', '2025-2026'],
    });
  });

  test('falls back to computeDefaultCycleLabel when the current cycle is a non-standard custom label', async () => {
    getCurrentCycle.mockResolvedValue('Custom Cycle Label');
    InternshipApplication.distinct.mockResolvedValue([]);

    const res = mockRes();
    await getCycleInfo({ user: adminUser }, res, jest.fn());

    const payload = res.json.mock.calls[0][0];
    expect(payload.suggestedNextCycle).toBe('2099-2100');
  });
});

describe('advanceCycle', () => {
  test('archives the outgoing cycle\'s applications and stores the new current cycle', async () => {
    getCurrentCycle.mockResolvedValue('2026-2027');
    InternshipApplication.updateMany.mockResolvedValue({ modifiedCount: 42 });

    const req = { user: adminUser, body: { newCycle: '2027-2028' } };
    const res = mockRes();
    const next = jest.fn();

    await advanceCycle(req, res, next);

    expect(InternshipApplication.updateMany).toHaveBeenCalledWith(
      { applicationCycle: '2026-2027', deletedAt: null, archivedAt: null },
      { $set: { archivedAt: expect.any(Date), archivedBy: 'admin-uuid' } },
    );
    expect(setCurrentCycle).toHaveBeenCalledWith('2027-2028');
    expect(res.json).toHaveBeenCalledWith({
      error: null,
      previousCycle: '2026-2027',
      newCycle: '2027-2028',
      archivedCount: 42,
    });
  });

  test('defaults to the suggested next cycle when newCycle is omitted from the body', async () => {
    getCurrentCycle.mockResolvedValue('2026-2027');
    InternshipApplication.updateMany.mockResolvedValue({ modifiedCount: 0 });

    const req = { user: adminUser, body: {} };
    const res = mockRes();

    await advanceCycle(req, res, jest.fn());

    expect(setCurrentCycle).toHaveBeenCalledWith('2027-2028');
  });

  test('rejects when newCycle equals the current cycle', async () => {
    getCurrentCycle.mockResolvedValue('2026-2027');
    const next = jest.fn();

    await advanceCycle({ user: adminUser, body: { newCycle: '2026-2027' } }, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const passed = next.mock.calls[0][0];
    expect(passed).toBeInstanceOf(error.BadRequest);
    expect(InternshipApplication.updateMany).not.toHaveBeenCalled();
    expect(setCurrentCycle).not.toHaveBeenCalled();
  });

  test('rejects a blank newCycle', async () => {
    getCurrentCycle.mockResolvedValue('2026-2027');
    const next = jest.fn();

    await advanceCycle({ user: adminUser, body: { newCycle: '   ' } }, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(error.BadRequest);
  });
});

describe('getAllApplications — search and archived query params', () => {
  const setupFind = () => {
    InternshipApplication.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
    InternshipApplication.countDocuments.mockResolvedValue(0);
  };

  test('defaults to excluding archived applications (archivedAt: null)', async () => {
    setupFind();
    const req = { user: adminUser, query: {} };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    expect(query.archivedAt).toBeNull();
  });

  test('archived=true returns only archived applications', async () => {
    setupFind();
    const req = { user: adminUser, query: { archived: true } };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    expect(query.archivedAt).toEqual({ $ne: null });
  });

  test('search builds a case-insensitive $or across firstName/lastName/email', async () => {
    setupFind();
    const req = { user: adminUser, query: { search: 'ada' } };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    expect(query.$or).toHaveLength(3);
    expect(query.$or[0].firstName).toBeInstanceOf(RegExp);
    expect(query.$or[0].firstName.flags).toContain('i');
    expect(query.$or[0].firstName.test('Ada Lovelace')).toBe(true);
  });

  test('search input is regex-escaped so special characters cannot break the query', async () => {
    setupFind();
    const req = { user: adminUser, query: { search: 'a.b+c' } };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    const emailRegex = query.$or[2].email;
    expect(emailRegex.test('a.b+c@example.com')).toBe(true);
    expect(emailRegex.test('axbxc@example.com')).toBe(false);
  });

  test('officer committee-scope and search combine via $and instead of clobbering each other', async () => {
    setupFind();
    Committee.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { id: 'committee-1', name: 'Hack', displayName: 'Hack' },
      ]),
    });
    const officerUser = {
      uuid: 'officer-uuid',
      isAdmin: () => false,
      isOfficer: () => true,
      committees: ['Hack'],
    };
    const req = { user: officerUser, query: { search: 'ada' } };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    expect(query.$or).toBeUndefined();
    expect(query.$and).toHaveLength(2);
    expect(query.$and[0].$or[0]).toHaveProperty('firstChoiceCommittee');
    expect(query.$and[1].$or[0]).toHaveProperty('firstName');
  });

  test('committeeId matches any of the 3 choice slots, not just the first', async () => {
    setupFind();
    const req = { user: adminUser, query: { committeeId: 'c1' } };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    expect(query.$or).toEqual([
      { firstChoiceCommittee: 'c1' },
      { secondChoiceCommittee: 'c1' },
      { thirdChoiceCommittee: 'c1' },
    ]);
  });

  test('status matches any of the 3 choice slots, not just the first', async () => {
    setupFind();
    const req = { user: adminUser, query: { status: 'reviewing' } };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    expect(query.$or).toEqual([
      { firstChoiceStatus: 'reviewing' },
      { secondChoiceStatus: 'reviewing' },
      { thirdChoiceStatus: 'reviewing' },
    ]);
  });

  test('committeeId and status are paired per-slot, not independently — a different slot with the same status must not match', async () => {
    setupFind();
    const req = { user: adminUser, query: { committeeId: 'c1', status: 'reviewing' } };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    // Combined into one $or (not two separate $and members), so each clause
    // requires committee AND status on the SAME slot.
    expect(query.$or).toEqual([
      { firstChoiceCommittee: 'c1', firstChoiceStatus: 'reviewing' },
      { secondChoiceCommittee: 'c1', secondChoiceStatus: 'reviewing' },
      { thirdChoiceCommittee: 'c1', thirdChoiceStatus: 'reviewing' },
    ]);

    // An application where committee c1 is the 1st choice (status accepted)
    // but an unrelated 2nd choice happens to be "reviewing" must NOT match
    // any clause — proves the fields aren't independently ORed.
    const wouldFalselyMatchOldLogic = {
      firstChoiceCommittee: 'c1',
      firstChoiceStatus: 'accepted',
      secondChoiceCommittee: 'c2',
      secondChoiceStatus: 'reviewing',
    };
    const matchesAnyClause = query.$or.some((clause) => Object.entries(clause).every(
      ([field, value]) => wouldFalselyMatchOldLogic[field] === value,
    ));
    expect(matchesAnyClause).toBe(false);
  });

  test('officer scope and an explicit status combine per-slot too', async () => {
    setupFind();
    Committee.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { id: 'committee-1', name: 'Hack', displayName: 'Hack' },
      ]),
    });
    const officerUser = {
      uuid: 'officer-uuid',
      isAdmin: () => false,
      isOfficer: () => true,
      committees: ['Hack'],
    };
    const req = { user: officerUser, query: { status: 'reviewing' } };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    expect(query.$or).toEqual([
      { firstChoiceCommittee: { $in: ['committee-1'] }, firstChoiceStatus: 'reviewing' },
      { secondChoiceCommittee: { $in: ['committee-1'] }, secondChoiceStatus: 'reviewing' },
      { thirdChoiceCommittee: { $in: ['committee-1'] }, thirdChoiceStatus: 'reviewing' },
    ]);
  });

  test('choiceRank restricts officer scoping to one specific slot, not any slot', async () => {
    setupFind();
    Committee.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { id: 'committee-1', name: 'Hack', displayName: 'Hack' },
      ]),
    });
    const officerUser = {
      uuid: 'officer-uuid',
      isAdmin: () => false,
      isOfficer: () => true,
      committees: ['Hack'],
    };
    const req = { user: officerUser, query: { choiceRank: '2' } };

    await getAllApplications(req, mockRes());

    const query = InternshipApplication.find.mock.calls[0][0];
    expect(query.$or).toEqual([
      { secondChoiceCommittee: { $in: ['committee-1'] } },
    ]);
  });
});

describe('getApplicationStatusCounts', () => {
  test('officer gets counts scoped to their own committee via aggregation', async () => {
    Committee.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { id: '507f1f77bcf86cd799439011', name: 'Hack', displayName: 'Hack' },
      ]),
    });
    InternshipApplication.aggregate.mockResolvedValue([
      { _id: 'pending', count: 3 },
      { _id: 'reviewing', count: 5 },
    ]);
    const officerUser = {
      uuid: 'officer-uuid',
      isAdmin: () => false,
      isOfficer: () => true,
      committees: ['Hack'],
    };

    const res = mockRes();
    await getApplicationStatusCounts({ user: officerUser, query: {} }, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      counts: { pending: 3, reviewing: 5 },
    });
  });

  test('admin must pass a committeeId, or gets a 400', async () => {
    const res = mockRes();
    const adminUserForCounts = { isAdmin: () => true, isOfficer: () => false };

    await getApplicationStatusCounts({ user: adminUserForCounts, query: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(InternshipApplication.aggregate).not.toHaveBeenCalled();
  });

  test('returns empty counts when the officer has no committees', async () => {
    const res = mockRes();
    const officerWithNoCommittees = {
      uuid: 'officer-uuid',
      isAdmin: () => false,
      isOfficer: () => true,
      committees: [],
    };

    await getApplicationStatusCounts({ user: officerWithNoCommittees, query: {} }, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, counts: {} });
    expect(InternshipApplication.aggregate).not.toHaveBeenCalled();
  });
});
