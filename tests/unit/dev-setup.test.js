jest.mock('../../app/api/v1/internship/models/Committee', () => ({
  Committee: { updateOne: jest.fn() },
}));

const { Committee } = require('../../app/api/v1/internship/models/Committee');
const devSetup = require('../../app/db/dev-setup');

const { Committee: RealCommittee } = jest.requireActual('../../app/api/v1/internship/models/Committee');

let User;
let Event;

beforeEach(() => {
  jest.resetAllMocks();
  Committee.updateOne.mockResolvedValue({});
  User = {
    upsert: jest.fn().mockResolvedValue({}),
    findOrCreate: jest.fn().mockResolvedValue([{}, true]),
  };
  Event = { findOrCreate: jest.fn().mockResolvedValue([{}, true]) };
});

test('waits for every committee before starting user or event seeds', async () => {
  let finishDesign;
  const designReady = new Promise((resolve) => {
    finishDesign = resolve;
  });
  Committee.updateOne.mockImplementation((query, update) => (
    update.$set.name === 'Design' ? designReady : Promise.resolve({})
  ));

  const seeding = devSetup(User, Event);
  await new Promise((resolve) => {
    setImmediate(resolve);
  });
  const writesBeforeCommitteesReady = [
    User.upsert.mock.calls.length,
    User.findOrCreate.mock.calls.length,
    Event.findOrCreate.mock.calls.length,
  ];
  finishDesign({});
  await seeding;

  expect(writesBeforeCommitteesReady).toEqual([0, 0, 0]);
  expect(User.upsert).toHaveBeenCalled();
  expect(User.findOrCreate).toHaveBeenCalled();
  expect(Event.findOrCreate).toHaveBeenCalled();
});

test('does not seed users or events when committee seeding fails', async () => {
  const failure = new Error('committee seed failed');
  Committee.updateOne.mockRejectedValueOnce(failure);

  await expect(devSetup(User, Event)).rejects.toThrow(failure);

  expect(User.upsert).not.toHaveBeenCalled();
  expect(User.findOrCreate).not.toHaveBeenCalled();
  expect(Event.findOrCreate).not.toHaveBeenCalled();
});

describe('legacy committee names', () => {
  let rows;

  beforeEach(() => {
    rows = [];
    // Keep real Mongoose casting, but simulate MongoDB writes without a connection.
    jest.spyOn(RealCommittee.collection, 'updateOne').mockImplementation(async (filter, update, options = {}) => {
      const row = rows.find((candidate) => (
        typeof filter.name === 'string'
          ? candidate.name === filter.name
          : filter.name.$in.includes(candidate.name)
      ));
      if (row) {
        Object.assign(row, update.$set);
        return { matchedCount: 1, modifiedCount: 1 };
      }
      if (options.upsert) {
        rows.push({ ...update.$setOnInsert, ...update.$set });
        return { matchedCount: 0, upsertedCount: 1 };
      }
      return { matchedCount: 0, modifiedCount: 0 };
    });
    Committee.updateOne.mockImplementation((...args) => RealCommittee.updateOne(...args));
    User.findOrCreate.mockImplementation(async ({ defaults }) => {
      const unknown = (defaults.committees || []).filter(
        (name) => !rows.some((row) => row.name === name),
      );
      if (unknown.length) throw new Error(`Invalid committee(s): ${unknown.join(', ')}`);
      return [{}, true];
    });
  });

  afterEach(() => jest.restoreAllMocks());

  test.each([
    ['cloud', 'Cloud'],
    ['Dev', 'Dev Team'],
  ])('normalizes %s to %s before seeding users without replacing the record', async (legacyName, name) => {
    const existing = { _id: 'legacy-committee', name: legacyName, isActive: false };
    rows.push(existing);

    await expect(devSetup(User, Event)).resolves.toBeNull();

    expect(existing).toEqual(expect.objectContaining({
      _id: 'legacy-committee', name, isActive: false,
    }));
    expect(rows.filter((row) => row.name === name)).toHaveLength(1);
  });

  test('applies model defaults when inserting committees into an empty database', async () => {
    await devSetup(User, Event);

    expect(rows.find((row) => row.name === 'Cloud')).toEqual(expect.objectContaining({
      isActive: true, decisionsReleased: false, customQuestions: [],
    }));
  });

  test('prefers an existing canonical record when a legacy spelling also exists', async () => {
    const canonical = { _id: 'canonical-cloud', name: 'Cloud' };
    const legacy = { _id: 'legacy-cloud', name: 'cloud' };
    rows.push(legacy, canonical);

    await devSetup(User, Event);

    expect(canonical.name).toBe('Cloud');
    expect(legacy.name).toBe('cloud');
    expect(rows.filter((row) => row.name === 'Cloud')).toHaveLength(1);
  });
});
