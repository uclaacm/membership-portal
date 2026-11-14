import request from 'supertest';
import { server } from '../..';

const jwt = require('jsonwebtoken');
const { User, db: Sequelize } = require('../../app/db');
const config = require('../../app/config');
const { Committee } = require('../../app/api/v1/internship/models/Committee');

const API_ROUTE = '/app/api/v1/';
const route = (name) => API_ROUTE + name;
const fixtureId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const committeeNames = {
  AI: `leaderboard-ai-${fixtureId}`,
  Hack: `leaderboard-hack-${fixtureId}`,
};
const createdCommittees = [];

const getJWTToken = (user) => new Promise((res, rej) => {
  jwt.sign(
    {
      uuid: user.getDataValue('uuid'),
      admin: user.isAdmin(),
      superAdmin: user.isSuperAdmin(),
      officer: user.isOfficer(),
      registered: !user.isPending(),
    },
    config.session.secret,
    { expiresIn: 3600 },
    (err, jwtToken) => {
      if (err) return rej(err);
      return res(jwtToken);
    },
  );
});

beforeAll(async () => {
  await Sequelize.sync();
  await Promise.all(Object.values(committeeNames).map(async (name) => {
    createdCommittees.push(await Committee.create({ name, displayName: name }));
  }));
});

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  await Sequelize.close();
});

describe('GET /leaderboard/admin', () => {
  // Nested cleanup runs before the integration setup disconnects MongoDB.
  afterAll(() => Promise.all(createdCommittees.map((committee) => committee.deleteOne())));

  let adminUser;
  let adminToken;
  let officerUser;
  let officerToken;
  let standardUser;
  let standardToken;
  let memberYear3;
  let hackOfficer;
  let createdUsers;

  const createUser = async (values) => {
    const user = await User.create({ ...values, lastActiveAt: new Date() });
    createdUsers.push(user);
    return user;
  };

  beforeEach(async () => {
    createdUsers = [];
    adminUser = await createUser({
      email: `admin-${Date.now()}@test.com`,
      firstName: 'Admin',
      lastName: 'User',
      accessType: 'ADMIN',
      state: 'ACTIVE',
      year: 4,
      major: 'CS',
    });
    adminToken = await getJWTToken(adminUser);

    officerUser = await createUser({
      email: `officer-${Date.now()}@test.com`,
      firstName: 'Officer',
      lastName: 'User',
      accessType: 'OFFICER',
      state: 'ACTIVE',
      year: 3,
      major: 'CS',
      committees: [committeeNames.AI],
    });
    officerToken = await getJWTToken(officerUser);

    standardUser = await createUser({
      email: `standard-${Date.now()}@test.com`,
      firstName: 'Standard',
      lastName: 'User',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 2,
      major: 'Math',
    });
    standardToken = await getJWTToken(standardUser);

    memberYear3 = await createUser({
      email: `year3-${Date.now()}@test.com`,
      firstName: 'Year3',
      lastName: 'Member',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 3,
      major: 'CS',
    });

    hackOfficer = await createUser({
      email: `hack-officer-${Date.now()}@test.com`,
      firstName: 'Hack',
      lastName: 'Officer',
      accessType: 'OFFICER',
      state: 'ACTIVE',
      year: 2,
      major: 'CS',
      committees: [committeeNames.Hack],
    });
  });

  afterEach(async () => {
    await Promise.all((createdUsers || []).map((user) => user.destroy()));
  });

  test('standard user gets 403', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin'))
      .auth(standardToken, { type: 'bearer' });
    expect(res.statusCode).toBe(403);
  });

  test('unauthenticated gets 401', async () => {
    const res = await request(server).get(route('leaderboard/admin'));
    expect(res.statusCode).toBe(401);
  });

  test('officer sees only STANDARD users by default', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin'))
      .auth(officerToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
    const ids = res.body.leaderboard.map((u) => u.id);
    expect(ids).toEqual(expect.arrayContaining([standardUser.uuid, memberYear3.uuid]));
    [adminUser, officerUser, hackOfficer].forEach((user) => {
      expect(ids).not.toContain(user.uuid);
    });
  });

  test('admin sees all access types by default', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin'))
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
    expect(res.body.leaderboard.map((u) => u.id)).toEqual(expect.arrayContaining([
      adminUser.uuid, officerUser.uuid, standardUser.uuid, memberYear3.uuid, hackOfficer.uuid,
    ]));
  });

  test('officer can filter by year', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin?year=3'))
      .auth(officerToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
    expect(res.body.leaderboard.map((u) => u.id)).toContain(memberYear3.uuid);
    expect(res.body.leaderboard.map((u) => u.id)).not.toContain(standardUser.uuid);
  });

  test('officer cannot filter by role (ignored)', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin?role=ADMIN'))
      .auth(officerToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('officer cannot filter by committee (ignored)', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin'))
      .query({ committee: committeeNames.Hack })
      .auth(officerToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('admin can filter by role=MEMBER', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin?role=MEMBER'))
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
    expect(res.body.leaderboard.length).toBeGreaterThanOrEqual(1);
  });

  test('admin can filter by committee', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin'))
      .query({ committee: committeeNames.Hack })
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
    expect(res.body.leaderboard.map((u) => u.id)).toEqual([hackOfficer.uuid]);
  });
});
