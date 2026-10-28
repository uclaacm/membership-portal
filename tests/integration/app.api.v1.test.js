import request from 'supertest';
import { server } from '../..';

const jwt = require('jsonwebtoken');
const { User, Activity, db: Sequelize } = require('../../app/db');
const config = require('../../app/config');

const API_ROUTE = '/app/api/v1/';
const route = (name) => API_ROUTE + name;

beforeAll(async () => {
  // Initialize tables without running the unrelated development-data seed.
  await Sequelize.sync();
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await Sequelize.close();
});

describe('Health Tests', () => {
  test('Should respond with correct properties and status', async () => {
    const response = await request(server).get(route('health'));
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('cpu');
    expect(response.body).toHaveProperty('memory');
    expect(response.body).toHaveProperty('uptime');
  });
});

describe('Auth Tests', () => {
  test('Expect error on no OAuth token', async () => {
    const authResponse = await request(server).post(route('auth/login'));
    expect(authResponse.statusCode).toBe(400);
    expect(authResponse.error).toBeTruthy();
    expect(authResponse.error.text).toBe('{"error":{"status":400,"message":"Invalid token."}}');
  });

  test('Expect error on invalid OAuth token', async () => {
    const authResponse = await request(server).post('/app/api/v1/auth/login').send({
      tokenId: 'this.is.fake',
    });
    expect(authResponse.error).toBeTruthy();
    expect(authResponse.statusCode).toBe(500);
  });
});

describe('User Tests', () => {
  // TODO: This should be extracted from auth
  const getJWTToken = (user) => new Promise((res, rej) => {
    jwt.sign(
      {
        uuid: user.getDataValue('uuid'),
        admin: user.isAdmin(),
        superAdmin: user.isSuperAdmin(),
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

  let testUser;
  let testToken;

  // Generate unique user before each test
  beforeEach(async () => {
    const uniqueEmail = `testuser${Date.now()}@testemail.com`; // Unique email
    testUser = await User.create({
      email: uniqueEmail, // Use unique email here
      firstName: 'TEST_FIRST_NAME',
      lastName: 'TEST_LAST_NAME',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 5,
      major: 'Undeclared',
    });
    await Activity.accountCreated(testUser.uuid);
    testToken = await getJWTToken(testUser);
  });

  afterEach(async () => {
    if (testUser) {
      await Activity.destroy({ where: { user: testUser.uuid } });
      await testUser.destroy();
    }
    testUser = undefined;
    testToken = undefined;
  });

  test('Get User info', async () => {
    const userResponse = await request(server).get(route('user')).auth(testToken, { type: 'bearer' });
    expect(userResponse.error).toBeFalsy();

    const userInfo = userResponse.body.user;
    expect(userInfo).toEqual(testUser.getUserProfile());
  });

  test('Unauthorized get User info', async () => {
    const userResponse = await request(server).get(route('user'));
    expect(userResponse.error).toBeTruthy();
    expect(userResponse.statusCode).toBe(401);
  });

  describe('Test update User', () => {
    test('Invalid update body', async () => {
      const patchResponse = await request(server).patch(route('user')).auth(testToken, { type: 'bearer' });
      expect(patchResponse.error).toBeTruthy();
      expect(patchResponse.statusCode).toBe(400);
    });

    test('Unauthorized update User info', async () => {
      const patchResponse = await request(server).patch(route('user')).auth();
      expect(patchResponse.error).toBeTruthy();
      expect(patchResponse.statusCode).toBe(401);
    });
  });

  describe('Test User activities', () => {
    test('Has ACCOUNT_CREATE activity', async () => {
      const activityResponse = await request(server).get(route('user/activity')).auth(testToken, { type: 'bearer' });
      expect(activityResponse.error).toBeFalsy();
      expect(activityResponse.body.activity).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ACCOUNT_CREATE',
          }),
        ]),
      );
    });

    test('Unauthorized get User activity', async () => {
      const activityResponse = await request(server).get(route('user/activity'));
      expect(activityResponse.error).toBeDefined();
      expect(activityResponse.statusCode).toBe(401);
    });
  });
});
