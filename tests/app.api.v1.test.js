import { server, setup } from '..';
import request from 'supertest';

const { User, Activity } = require('../app/db');
const config = require('../app/config');
const jwt = require('jsonwebtoken');

const API_ROUTE = '/app/api/v1/';
const route = name => API_ROUTE + name;


beforeAll(async () => {
  await setup;
});

afterAll(() => {
  server.close();
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

  //TODO: This should be extracted from auth
  const getJWTToken = async (user) => {
    return await new Promise((res, rej) => jwt.sign(
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
  }

  let testUser;
  let testAdmin; //TODO: implement test admin user
  let testPendingUser; //TODO: implement test pending user
  let testToken;

  beforeEach(async () => {
    testUser = await User.create({
      email: "testuser@testemail.com",
      firstName: "TEST_FIRST_NAME",
      lastName: "TEST_LAST_NAME",
      accessType: "STANDARD",
      state: "ACTIVE",
      year: 5,
      major: "Undeclared",
    });
    Activity.accountCreated(testUser.uuid)
    testToken = await getJWTToken(testUser);
  });

  afterEach(async () => {
    testUser.destroy();
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
      const patchResponse = await request(server).patch(route('user')).auth(testToken, { type: 'bearer'});
      expect(patchResponse.error).toBeTruthy();
      expect(patchResponse.statusCode).toBe(400);
    });

    test('Unauthorized update User info', async () => {
      const patchResponse = await request(server).patch(route('user')).auth;
      expect(patchResponse.error).toBeTruthy();
      expect(patchResponse.statusCode).toBe(401);
    });

    test("Unauthorized pending User", async () => {
      // TODO: implement tests
    });

  });


  describe('Test User activities', () => {

    test('Has ACCOUNT_CREATE activity', async () => {
      const activityResponse = await request(server).get(route('user/activity')).auth(testToken, { type: 'bearer' });
      expect(activityResponse.error).toBeFalsy();
      expect(activityResponse.body.activity).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "ACCOUNT_CREATE"
          })
        ])
      )
    });
  
    test('Unauthorized get User activity', async () => {
      const activityResponse = await request(server).get(route('user/activity'));
      expect(activityResponse.error).toBeDefined();
      expect(activityResponse.statusCode).toBe(401);
    });

  });

});
