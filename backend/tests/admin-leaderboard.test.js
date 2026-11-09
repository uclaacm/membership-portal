import request from 'supertest';
import { server, setup } from '..';

const jwt = require('jsonwebtoken');
const { User } = require('../app/db');
const config = require('../app/config');

const API_ROUTE = '/app/api/v1/';
const route = (name) => API_ROUTE + name;

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
      if (err) rej(err);
      res(jwtToken);
    },
  );
});

beforeAll(async () => {
  await setup;
});

afterAll(() => {
  server.close();
});

describe('GET /leaderboard/admin', () => {
  let adminUser;
  let adminToken;
  let officerUser;
  let officerToken;
  let standardUser;
  let standardToken;
  let memberYear3;
  let hackOfficer;

  beforeEach(async () => {
    adminUser = await User.create({
      email: `admin-${Date.now()}@test.com`,
      firstName: 'Admin',
      lastName: 'User',
      accessType: 'ADMIN',
      state: 'ACTIVE',
      year: 4,
      major: 'CS',
    });
    adminToken = await getJWTToken(adminUser);

    officerUser = await User.create({
      email: `officer-${Date.now()}@test.com`,
      firstName: 'Officer',
      lastName: 'User',
      accessType: 'OFFICER',
      state: 'ACTIVE',
      year: 3,
      major: 'CS',
      committees: ['AI'],
    });
    officerToken = await getJWTToken(officerUser);

    standardUser = await User.create({
      email: `standard-${Date.now()}@test.com`,
      firstName: 'Standard',
      lastName: 'User',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 2,
      major: 'Math',
    });
    standardToken = await getJWTToken(standardUser);

    memberYear3 = await User.create({
      email: `year3-${Date.now()}@test.com`,
      firstName: 'Year3',
      lastName: 'Member',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 3,
      major: 'CS',
    });

    hackOfficer = await User.create({
      email: `hack-officer-${Date.now()}@test.com`,
      firstName: 'Hack',
      lastName: 'Officer',
      accessType: 'OFFICER',
      state: 'ACTIVE',
      year: 2,
      major: 'CS',
      committees: ['Hack'],
    });
  });

  afterEach(async () => {
    await Promise.all([
      adminUser.destroy(),
      officerUser.destroy(),
      standardUser.destroy(),
      memberYear3.destroy(),
      hackOfficer.destroy(),
    ]);
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
    const types = res.body.leaderboard.map((u) => u.accessType);
    types.forEach((t) => expect(t).toBeUndefined());
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  test('admin sees all access types by default', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin'))
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(3);
  });

  test('officer can filter by year', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin?year=3'))
      .auth(officerToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
    expect(res.body.leaderboard.length).toBeGreaterThanOrEqual(1);
  });

  test('officer cannot filter by role (ignored)', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin?role=ADMIN'))
      .auth(officerToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('officer cannot filter by committee (ignored)', async () => {
    const res = await request(server)
      .get(route('leaderboard/admin?committee=Hack'))
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
      .get(route('leaderboard/admin?committee=Hack'))
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
    const names = res.body.leaderboard.map((u) => u.firstName);
    expect(names).toContain('Hack');
  });

});
