import { server, setup } from '..';
import request from 'supertest';

const { User, Activity } = require('../app/db');
const config = require('../app/config');
const jwt = require('jsonwebtoken');

const API_ROUTE = '/app/api/v1/';
const TEST_ADMIN_EMAIL = 'acm@g.ucla.edu';

const route = name => API_ROUTE + name;

// console.error = jest.fn();

beforeAll(async () => {
  await setup;
  // await request(server).get(route('health/setup'));
});

afterAll(() => {
  server.close();
});

describe('Health Tests', () => {
  const healthResponsePromise = request(server).get(route('health'));

  test('Should respond with status code 200', async () => {
    const response = await healthResponsePromise;
    return expect(response.statusCode).toBe(200);
  });

  test('Should have CPU key', async () => {
    const response = await healthResponsePromise;
    return expect(response.body).toHaveProperty('cpu');
  });

  test('Should have Memory key', async () => {
    const response = await healthResponsePromise;
    return expect(response.body).toHaveProperty('memory');
  });

  test('Should have Uptime key', async () => {
    const response = await healthResponsePromise;
    return expect(response.body).toHaveProperty('uptime');
  });
});

describe('Auth Tests', () => {
  test('Expect error on no OAuth token', async () => {
    const authResponse = await request(server).post(route('auth/login'));
    expect(authResponse.statusCode).toBe(400);
    expect(authResponse.error.text).toBe('{"error":{"status":400,"message":"Invalid token."}}');
  });

  test('Expect error on invalid OAuth token', async () => {
    const authResponse = await request(server).post('/app/api/v1/auth/login').send({
      tokenId: 'this.is.fake',
    });
    expect(authResponse.statusCode).toBe(500);
  });
});

describe('User Tests', () => {
  let user;
  let token;

  beforeAll(async () => {
    user = await User.findByEmail(TEST_ADMIN_EMAIL);
    token = await new Promise((res, rej) => jwt.sign(
      {
        uuid: user.getDataValue('uuid'),
        admin: user.isAdmin(),
        superAdmin: user.isSuperAdmin(),
        registered: !user.isPending(),
      },
      config.session.secret,
      { expiresIn: 3600 },
      (err, jwt_token) => {
        if (err) rej(err);
        Activity.accountLoggedIn(user.uuid);
        res(jwt_token);
      },
    ));
  });

  test('Get User info', async () => {
    const userResponse = await request(server).get(route('user')).auth(token, { type: 'bearer' });
    const userInfo = userResponse.body.user;
    expect(userInfo.uuid).toBe(user.uuid);
    expect(userInfo.email).toBe(user.email);
  });
});
