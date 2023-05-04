import { server, setup } from '..';
import request from 'supertest';

const { createNewUser, createUserToken, GoogleLogin } = require('../app/api/v1/auth/LoginManager');
const { User, Activity, Event } = require('../app/db');

const API_ROUTE = '/app/api/v1/';
const route = name => API_ROUTE + name;


beforeAll(async () => {
  await setup;
});

afterAll(() => {
  server.close();
});

// TODO: figure out a way to separate tests into different files

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

  test('Expect ticket to create new user', async () => {
    try {
      const mockTicket = {
        getPayload: () => ({
          given_name: 'LoginTest',
          family_name: 'Tester',
          email: 'fakeemail@g.ucla.edu',
          picture: 'fakePicture',
          googleId: 'fakeGoogleId',
        }),
      };
      const login = new GoogleLogin(mockTicket);

      await login.login();
      expect(login.loginIsValid()).toBeTruthy();
      expect(login.user).toBeDefined();
      expect(login.user.firstName).toBe('LoginTest');
      expect(login.jwt).toBeDefined();

      const user = await User.findByEmail('fakeemail@g.ucla.edu');
      expect(user).toBeDefined();
    } finally {
      await User.findByEmail('fakeemail@g.ucla.edu').then((user) => {
        if (user) user.destroy();
      });
    }
  });
});


describe('User Tests', () => {
  let testUser;
  // let testAdmin; // TODO: implement test admin user
  // let testPendingUser; // TODO: implement test pending user
  let testToken;

  beforeEach(async () => {
    testUser = await createNewUser({
      email: 'testuser@testemail.com',
      firstName: 'TEST_FIRST_NAME',
      lastName: 'TEST_LAST_NAME',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 5,
      major: 'Undeclared',
    });
    await Activity.accountLoggedIn(testUser.uuid);
    testToken = await createUserToken(testUser)
      .catch((err) => { throw err; });
  });

  afterEach(async () => {
    await testUser.destroy();
    testToken = undefined;
  });


  test('Get User info', async () => {
    expect(testUser).toBeDefined();
    expect(testToken).toBeDefined();
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

    test('Unauthorized pending User', async () => {
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
            type: 'ACCOUNT_CREATE',
          }),
        ]),
      );
    });

    test('Unauthorized get User activity', async () => {
      const activityResponse = await request(server).get(route('user/activity'));
      expect(activityResponse.error).toBeTruthy();
      expect(activityResponse.statusCode).toBe(401);
    });
  });
});

describe('Test Get Events', () => {
  let user;
  let adminUser;
  let pendingUser;
  let userToken;
  let pendingToken;
  let adminToken;

  beforeAll(async () => {
    user = await createNewUser({
      email: 'testuser@testemail.com',
      firstName: 'USER_FIRST_NAME',
      lastName: 'USER_LAST_NAME',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 5,
      major: 'Undeclared',
    });
    await Activity.accountLoggedIn(user.uuid);
    userToken = await createUserToken(user)
      .catch((err) => { throw err; });

    pendingUser = await createNewUser({
      email: 'testuserpending@testemail.com',
      firstName: 'PENDING_FIRST_NAME',
      lastName: 'PENDING_LAST_NAME',
      accessType: 'STANDARD',
      state: 'PENDING',
      year: 5,
      major: 'Undeclared',
    });
    await Activity.accountLoggedIn(pendingUser.uuid);
    pendingToken = await createUserToken(pendingUser)
      .catch((err) => { throw err; });

    adminUser = await createNewUser({
      email: 'testadmin@testemail.com',
      firstName: 'ADMIN_FIRST_NAME',
      lastName: 'ADMIN_LAST_NAME',
      accessType: 'ADMIN',
      state: 'ACTIVE',
      year: 5,
      major: 'Undeclared',
    });
    await Activity.accountLoggedIn(adminUser.uuid);
    adminToken = await createUserToken(adminUser)
      .catch((err) => { throw err; });
  });

  afterAll(async () => {
    await user.destroy();
    await pendingUser.destroy();
    await adminUser.destroy();
    userToken = undefined;
    pendingToken = undefined;
    adminToken = undefined;
  });


  test('Pending user throws error', async () => {
    const eventResponse = await request(server)
      .get(route('event'))
      .auth(pendingToken, { type: 'bearer' });
    expect(eventResponse.error).toBeTruthy();
    expect(eventResponse.statusCode).toBe(403);
  });

  test('Get non-existent specific Event', async () => {
    const eventResponse = await request(server)
      .get(route('event/e0f284cb-6db9-4eb3-a3e7-5bd1a16e8672'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.event).toBeNull();
  });

  test('Get specific Event by UUID', async () => {
    const expectedEvent = await Event.findByAttendanceCode('d0ggo');
    const eventResponse = await request(server)
      .get(route(`event/${expectedEvent.uuid}?`))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.event).toBeDefined();
    expect(event.event.uuid).toBe(expectedEvent.uuid);
    expect(event.event.attendanceCode).toBeUndefined();
  });

  test('Get specific Event by UUID as Admin', async () => {
    const expectedEvent = await Event.findByAttendanceCode('d0ggo');
    const eventResponse = await request(server)
      .get(route(`event/${expectedEvent.uuid}?`))
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.event).toBeDefined();
    expect(event.event.uuid).toBe(expectedEvent.uuid);
    expect(event.event.attendanceCode).toBe('d0ggo');
  });

  test('Bad Event UUID query', async () => {
    const eventResponse = await request(server)
      .get(route('event/fake-uuid-1234'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.error.status).toBe(500);
    expect(event.event).toBeFalsy();
  });

  test('Bad page limit query', async () => {
    const eventResponse = await request(server)
      .get(route('event?offset=10&limit=bad'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
  });

  test('Bad page offset query', async () => {
    const eventResponse = await request(server)
      .get(route('event?offset=bad&limit=10'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
  });

  test('Bad committee query', async () => {
    const eventResponse = await request(server)
      .get(route('event?committee=bad123'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(0);
  });

  test('Get committee Events', async () => {
    const eventResponse = await request(server)
      .get(route('event?committee=Hack'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(2);
    expect(event.events[0].attendanceCode).toBeFalsy();
  });

  test('Get committee Events as Admin', async () => {
    const eventResponse = await request(server)
      .get(route('event?committee=Hack'))
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(2);
    expect(event.events[0].attendanceCode).toBeTruthy();
  });

  test('Get all Events', async () => {
    const eventResponse = await request(server)
      .get(route('event?'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(4);
    expect(event.events[0].attendanceCode).toBeFalsy();
  });

  test('Get all Events as Admin', async () => {
    const eventResponse = await request(server)
      .get(route('event?'))
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(4);
    expect(event.events[0].attendanceCode).toBeTruthy();
  });

  test('Get one event', async () => {
    const eventResponse = await request(server)
      .get(route('event?limit=1'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(1);
    expect(event.events[0].attendanceCode).toBeFalsy();
    expect(event.events[0].title).toBe('Project A*: Dynamic Programming');
  });

  test('Get second event', async () => {
    const eventResponse = await request(server)
      .get(route('event?limit=1&offset=1'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(1);
    expect(event.events[0].attendanceCode).toBeFalsy();
    expect(event.events[0].title).toBe('Intro to React');
  });

  test('Skip first event', async () => {
    const eventResponse = await request(server)
      .get(route('event?offset=1'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(3);
    expect(event.events[0].attendanceCode).toBeFalsy();
    expect(event.events[0].title).toBe('Intro to React');
    expect(event.events[1].title).toBe('Machine Learning with Tensorflow (part 5)');
    expect(event.events[2].title).toBe('Pet a Doggo');
  });

  test('Get first event of committee', async () => {
    const eventResponse = await request(server)
      .get(route('event?limit=1&committee=Hack'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(1);
    expect(event.events[0].attendanceCode).toBeFalsy();
    expect(event.events[0].title).toBe('Pet a Doggo');
  });

  test('Get second event of committee', async () => {
    const eventResponse = await request(server)
      .get(route('event?limit=1&offset=1&committee=Hack'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(1);
    expect(event.events[0].attendanceCode).toBeFalsy();
    expect(event.events[0].title).toBe('Intro to React');
  });

  test('Get skip first event of committee', async () => {
    const eventResponse = await request(server)
      .get(route('event?offset=1&committee=Hack'))
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeNull();
    expect(event.events).toBeDefined();
    expect(event.events).toHaveLength(1);
    expect(event.events[0].attendanceCode).toBeFalsy();
    expect(event.events[0].title).toBe('Intro to React');
  });
});


describe('Test Post Events', () => {
  let user;
  let adminUser;
  let pendingUser;
  let userToken;
  let pendingToken;
  let adminToken;
  let testEvent;

  beforeAll(async () => {
    user = await createNewUser({
      email: 'testuser@testemail.com',
      firstName: 'USER_FIRST_NAME',
      lastName: 'USER_LAST_NAME',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 5,
      major: 'Undeclared',
    });
    await Activity.accountLoggedIn(user.uuid);
    userToken = await createUserToken(user)
      .catch((err) => { throw err; });

    pendingUser = await createNewUser({
      email: 'testuserpending@testemail.com',
      firstName: 'PENDING_FIRST_NAME',
      lastName: 'PENDING_LAST_NAME',
      accessType: 'STANDARD',
      state: 'PENDING',
      year: 5,
      major: 'Undeclared',
    });
    await Activity.accountLoggedIn(pendingUser.uuid);
    pendingToken = await createUserToken(pendingUser)
      .catch((err) => { throw err; });

    adminUser = await createNewUser({
      email: 'testadmin@testemail.com',
      firstName: 'ADMIN_FIRST_NAME',
      lastName: 'ADMIN_LAST_NAME',
      accessType: 'ADMIN',
      state: 'ACTIVE',
      year: 5,
      major: 'Undeclared',
    });
    await Activity.accountLoggedIn(adminUser.uuid);
    adminToken = await createUserToken(adminUser)
      .catch((err) => { throw err; });

    testEvent = {
      title: 'TEST EVENT',
      description:
        '<p>Interested in petting a doggo? Come out to pet some doggos!</p>',
      committee: 'Hack',
      cover: 'https://media.giphy.com/media/Z3aQVJ78mmLyo/giphy.gif',
      location: 'De Neve Auditorium',
      eventLink: 'https://www.facebook.com/events/417554198601623/',
      startDate: new Date(2017, 5, 8, 14),
      endDate: new Date(2017, 5, 8, 18),
      attendanceCode: 'TEST',
      attendancePoints: 50,
      // thumb: ""
    };
  });

  afterAll(async () => {
    await user.destroy();
    await pendingUser.destroy();
    await adminUser.destroy();
    userToken = undefined;
    pendingToken = undefined;
    adminToken = undefined;
  });

  afterEach(async () => {
    const event = await Event.findByAttendanceCode(testEvent.attendanceCode);
    if (event) await event.destroy();
  });

  test('Bad UUID', async () => {
    const eventResponse = await request(server)
      .post(route('event/bad_uuid'))
      .send({
        event: {
          ...testEvent,
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Undefined event data', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Bad start date', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
          startDate: undefined,
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Bad end date', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
          endDate: undefined,
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Invalid start and end date', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
          startDate: new Date(),
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Invalid event data', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {

        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Invalid event thumbnail', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
          thumb: 'a',
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Invalid cover image', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
          cover: 'a',
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Invalid title', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
          title: 'a',
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Invalid location', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
          location: 'a',
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Invalid event link', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
          eventLink: 'a',
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Invalid event attendance code', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
          attendanceCode: 'a',
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Duplicate attendance code', async () => {
    // TODO
  });

  test('Invalid event attendance points', async () => {
    // TODO: any attendance points are valid?
    // negative values are deleted?
    // const eventResponse = await request(server).
    // post(route('event')).
    // send({ event: {
    //   ...testEvent,
    //   attendPoints: 0
    // }}).
    // auth(adminToken, { type: "bearer" });
    // const event = eventResponse.body;
    // expect(event.error).toBeTruthy();
    // expect(event.event).toBeFalsy();
  });

  test('Post event as Pending User', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
        },
      })
      .auth(pendingToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Post event as User', async () => {
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
        },
      })
      .auth(userToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeTruthy();
    expect(event.event).toBeFalsy();
  });

  test('Post event as Admin', async () => {
    // console.log("ADMIN POST");
    const eventResponse = await request(server)
      .post(route('event'))
      .send({
        event: {
          ...testEvent,
        },
      })
      .auth(adminToken, { type: 'bearer' });
    const event = eventResponse.body;
    expect(event.error).toBeFalsy();
    expect(event.event).toBeTruthy();
  });

  test('Multiple post calls', async () => {
    // TODO
  });
});

// describe('Test Patch Events', () => {
//   let user;
//   let adminUser;
//   let pendingUser;
//   let userToken;
//   let pendingToken;
//   let adminToken;

//   beforeAll(async () => {
//     user = await createNewUser({
//       email: 'testuser@testemail.com',
//       firstName: 'USER_FIRST_NAME',
//       lastName: 'USER_LAST_NAME',
//       accessType: 'STANDARD',
//       state: 'ACTIVE',
//       year: 5,
//       major: 'Undeclared',
//     });
//     await Activity.accountLoggedIn(user.uuid);
//     userToken = await createUserToken(user)
//       .catch((err) => { throw err; });

//     pendingUser = await createNewUser({
//       email: 'testuserpending@testemail.com',
//       firstName: 'PENDING_FIRST_NAME',
//       lastName: 'PENDING_LAST_NAME',
//       accessType: 'STANDARD',
//       state: 'PENDING',
//       year: 5,
//       major: 'Undeclared',
//     });
//     await Activity.accountLoggedIn(pendingUser.uuid);
//     pendingToken = await createUserToken(pendingUser)
//       .catch((err) => { throw err; });

//     adminUser = await createNewUser({
//       email: 'testadmin@testemail.com',
//       firstName: 'ADMIN_FIRST_NAME',
//       lastName: 'ADMIN_LAST_NAME',
//       accessType: 'ADMIN',
//       state: 'ACTIVE',
//       year: 5,
//       major: 'Undeclared',
//     });
//     await Activity.accountLoggedIn(adminUser.uuid);
//     adminToken = await createUserToken(adminUser)
//       .catch((err) => { throw err; });
//   });

//   afterAll(async () => {
//     await user.destroy();
//     userToken = undefined;
//   });

//   test('Bad UUID', async () => {});

//   test('Bad event', async () => {});

//   test('Bad event start date', async () => {});

//   test('Bad event end date', async () => {});
// });

describe('Test attend event', () => {

});
