const request = require('supertest');
const jwt = require('jsonwebtoken');
const { server, setup } = require('..');
const config = require('../app/config');
const { User, Event } = require('../app/db');

const API_ROUTE = '/app/api/v1';

const unique = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const makeToken = (user) => new Promise((resolve, reject) => {
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
    (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    },
  );
});

const createUser = async ({ accessType, committees = [] }) => User.create({
  email: `${unique(accessType.toLowerCase())}@test.local`,
  firstName: 'Test',
  lastName: 'User',
  accessType,
  committees,
  state: 'ACTIVE',
  year: 3,
  major: 'Computer Science',
});

beforeAll(async () => {
  await setup(false, true);
});

afterAll(() => {
  server.close();
});

describe('Repeated event routes', () => {
  test('Admin can create, update (from instance), and delete (from instance) repeated events', async () => {
    const admin = await createUser({ accessType: 'ADMIN' });
    const adminToken = await makeToken(admin);

    const startDate = new Date('2026-05-01T18:00:00.000Z');
    const endDate = new Date('2026-05-01T20:00:00.000Z');
    const repeatedCreateResponse = await request(server)
      .post(`${API_ROUTE}/event/repeated`)
      .auth(adminToken, { type: 'bearer' })
      .send({
        event: {
          committee: 'Hack',
          title: unique('Repeated Event'),
          description: 'Series',
          location: 'Boelter Hall',
          eventLink: 'https://example.com/series',
          cover: 'https://example.com/cover.png',
          startDate,
          endDate,
          attendanceCode: unique('SERIES'),
          attendancePoints: 1,
        },
        recurrence: {
          intervalWeeks: 1,
          seriesEndDate: '2026-05-15T18:00:00.000Z',
        },
      });

    expect(repeatedCreateResponse.statusCode).toBe(200);
    expect(repeatedCreateResponse.body).toHaveProperty('eventGroupId');
    expect(repeatedCreateResponse.body.events).toHaveLength(3);

    const { eventGroupId } = repeatedCreateResponse.body;
    const createdEvents = repeatedCreateResponse.body.events;
    const createdCodes = createdEvents.map((event) => event.attendanceCode);
    expect(new Set(createdCodes).size).toBe(createdCodes.length);
    const attendanceSuffix = /-[A-Za-z0-9]{4}$/;
    createdCodes.forEach((code) => {
      expect(code).toMatch(attendanceSuffix);
    });
    createdEvents.forEach((event) => {
      expect(event.eventGroupId).toBe(eventGroupId);
    });

    const secondEvent = createdEvents[1];
    const patchResponse = await request(server)
      .patch(`${API_ROUTE}/event/repeated/${eventGroupId}`)
      .auth(adminToken, { type: 'bearer' })
      .send({
        scope: 'fromInstance',
        fromUuid: secondEvent.uuid,
        event: { location: 'Updated Location' },
      });

    expect(patchResponse.statusCode).toBe(200);
    expect(patchResponse.body.events).toHaveLength(2);
    patchResponse.body.events.forEach((event) => {
      expect(event.location).toBe('Updated Location');
    });

    const groupResponse = await request(server)
      .get(`${API_ROUTE}/event/repeated/${eventGroupId}`)
      .auth(adminToken, { type: 'bearer' });

    expect(groupResponse.statusCode).toBe(200);
    expect(groupResponse.body.events).toHaveLength(3);
    expect(groupResponse.body.events[0].location).toBe('Boelter Hall');
    expect(groupResponse.body.events[1].location).toBe('Updated Location');
    expect(groupResponse.body.events[2].location).toBe('Updated Location');

    const deleteResponse = await request(server)
      .delete(`${API_ROUTE}/event/repeated/${eventGroupId}`)
      .auth(adminToken, { type: 'bearer' })
      .send({
        scope: 'fromInstance',
        fromUuid: secondEvent.uuid,
      });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.numDeleted).toBe(2);

    const remainingEvents = await Event.findAllByEventGroupId(eventGroupId);
    expect(remainingEvents).toHaveLength(1);

    await Event.destroy({ where: { eventGroupId } });
    await User.destroy({ where: { uuid: admin.uuid } });
  });
});
