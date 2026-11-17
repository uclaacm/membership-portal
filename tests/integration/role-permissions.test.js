const request = require('supertest');

const { server } = require('../..');
const { Event, db: Sequelize } = require('../../app/db');
const { InternshipApplication } = require('../../app/api/v1/internship/models/InternshipApplication');
const { API_ROUTE, unique, createFixtures } = require('./helpers');

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  await Sequelize.close();
});

// The permission matrix: a member can't manage anything, an officer can only manage their own
// committee's resources, and an admin can manage everything.
describe('role permissions on write routes', () => {
  const f = createFixtures();
  let hack;
  let ai;
  let member;
  let hackOfficer;
  let admin;

  beforeAll(async () => {
    hack = await f.createCommittee();
    ai = await f.createCommittee();
    member = await f.createUser();
    hackOfficer = await f.createUser({ accessType: 'OFFICER', committees: [hack.name] });
    admin = await f.createUser({ accessType: 'ADMIN' });
  });

  afterAll(() => f.cleanup());

  const as = (user) => ({
    get: (path) => request(server).get(`${API_ROUTE}${path}`).auth(f.tokenFor(user), { type: 'bearer' }),
    post: (path, body) => request(server).post(`${API_ROUTE}${path}`).auth(f.tokenFor(user), { type: 'bearer' }).send(body),
    patch: (path, body) => request(server).patch(`${API_ROUTE}${path}`).auth(f.tokenFor(user), { type: 'bearer' }).send(body),
    put: (path, body) => request(server).put(`${API_ROUTE}${path}`).auth(f.tokenFor(user), { type: 'bearer' }).send(body),
    delete: (path) => request(server).delete(`${API_ROUTE}${path}`).auth(f.tokenFor(user), { type: 'bearer' }),
  });

  const newEvent = (committee) => {
    const now = Date.now();
    return {
      event: {
        title: 'Permission Test Event',
        description: 'Created through the API by a permissions test.',
        location: 'Boelter 3400',
        committee,
        startDate: new Date(now + 24 * 3600 * 1000),
        endDate: new Date(now + 25 * 3600 * 1000),
        attendanceCode: unique('perm'),
        attendancePoints: 10,
      },
    };
  };

  // Events created through the API aren't tracked by the fixtures, so remove them here.
  const createdThroughApi = [];
  afterAll(() => Event.destroy({ where: { uuid: createdThroughApi } }));

  describe('creating events', () => {
    test('a member cannot create an event', async () => {
      const response = await as(member).post('/event', newEvent(hack.name));
      expect(response.statusCode).toBe(403);
    });

    test('an officer can create an event for their own committee', async () => {
      const response = await as(hackOfficer).post('/event', newEvent(hack.name));
      expect(response.statusCode).toBe(200);
      createdThroughApi.push(response.body.event.uuid);
    });

    test('an officer cannot create an event for another committee', async () => {
      const response = await as(hackOfficer).post('/event', newEvent(ai.name));
      expect(response.statusCode).toBe(403);
    });

    test('an admin can create an event for any committee', async () => {
      const response = await as(admin).post('/event', newEvent(ai.name));
      expect(response.statusCode).toBe(200);
      createdThroughApi.push(response.body.event.uuid);
    });
  });

  describe('editing and deleting events', () => {
    test('a member cannot edit an event', async () => {
      const event = await f.createEvent({ committee: hack.name });
      const response = await as(member).patch(`/event/${event.uuid}`, { event: { title: 'Hijacked' } });
      expect(response.statusCode).toBe(403);
    });

    test("an officer can edit their own committee's event", async () => {
      const event = await f.createEvent({ committee: hack.name });
      const response = await as(hackOfficer).patch(`/event/${event.uuid}`, { event: { title: 'Renamed by officer' } });
      expect(response.statusCode).toBe(200);
      expect(response.body.event.title).toBe('Renamed by officer');
    });

    test("an officer cannot edit another committee's event", async () => {
      const event = await f.createEvent({ committee: ai.name });
      const response = await as(hackOfficer).patch(`/event/${event.uuid}`, { event: { title: 'Hijacked' } });
      expect(response.statusCode).toBe(403);
    });

    test('an officer cannot move their event into another committee', async () => {
      const event = await f.createEvent({ committee: hack.name });
      const response = await as(hackOfficer).patch(`/event/${event.uuid}`, { event: { committee: ai.name } });
      expect(response.statusCode).toBe(403);
    });

    test('a member cannot delete an event', async () => {
      const event = await f.createEvent({ committee: hack.name });
      const response = await as(member).delete(`/event/${event.uuid}`);
      expect(response.statusCode).toBe(403);
      expect(await Event.eventExists(event.uuid)).toBe(true);
    });

    test("an officer cannot delete another committee's event", async () => {
      const event = await f.createEvent({ committee: ai.name });
      const response = await as(hackOfficer).delete(`/event/${event.uuid}`);
      expect(response.statusCode).toBe(403);
      expect(await Event.eventExists(event.uuid)).toBe(true);
    });

    test('an admin can delete any event', async () => {
      const event = await f.createEvent({ committee: ai.name });
      const response = await as(admin).delete(`/event/${event.uuid}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.numDeleted).toBe(1);
      expect(await Event.eventExists(event.uuid)).toBe(false);
    });
  });

  describe('attendance codes', () => {
    test('members never receive the attendance code', async () => {
      const event = await f.createEvent({ committee: hack.name });
      const response = await as(member).get(`/event/${event.uuid}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.event.attendanceCode).toBeUndefined();
    });

    test('officers and admins receive the attendance code', async () => {
      const event = await f.createEvent({ committee: hack.name });
      const officerView = await as(hackOfficer).get(`/event/${event.uuid}`);
      const adminView = await as(admin).get(`/event/${event.uuid}`);
      expect(officerView.body.event.attendanceCode).toBe(event.attendanceCode);
      expect(adminView.body.event.attendanceCode).toBe(event.attendanceCode);
    });
  });

  describe("viewing an event's check-ins and RSVPs", () => {
    test('a member cannot see who checked in or RSVPed', async () => {
      const event = await f.createEvent({ committee: hack.name });
      expect((await as(member).get(`/attendance/${event.uuid}`)).statusCode).toBe(403);
      expect((await as(member).get(`/rsvp/event/${event.uuid}`)).statusCode).toBe(403);
    });

    test("an officer can see their own committee's check-ins and RSVPs", async () => {
      const event = await f.createEvent({ committee: hack.name });
      expect((await as(hackOfficer).get(`/attendance/${event.uuid}`)).statusCode).toBe(200);
      expect((await as(hackOfficer).get(`/rsvp/event/${event.uuid}`)).statusCode).toBe(200);
    });

    test("an officer cannot see another committee's check-ins or RSVPs", async () => {
      const event = await f.createEvent({ committee: ai.name });
      expect((await as(hackOfficer).get(`/attendance/${event.uuid}`)).statusCode).toBe(403);
      expect((await as(hackOfficer).get(`/rsvp/event/${event.uuid}`)).statusCode).toBe(403);
    });
  });

  describe('reviewing internship applications', () => {
    let application;

    beforeAll(async () => {
      const applicant = await f.createUser();
      application = await InternshipApplication.create({
        userId: applicant.uuid,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        university: 'UCLA',
        major: 'Computer Science',
        graduationYear: 2028,
        applicationCycle: unique('cycle'),
        firstChoiceCommittee: ai._id,
        submissionStatus: 'submitted',
        submittedAt: new Date(),
      });
    });

    const setStatus = (user) => as(user).put(
      `/internship/applications/${application._id}/status`,
      { statusField: 'firstChoiceStatus', status: 'accepted' },
    );

    test('a member cannot change an application status', async () => {
      expect((await setStatus(member)).statusCode).toBe(403);
    });

    test('an officer cannot review an application to another committee', async () => {
      expect((await setStatus(hackOfficer)).statusCode).toBe(403);
      expect((await as(hackOfficer).get(`/internship/applications/${application._id}`)).statusCode).toBe(403);
    });

    test('an officer can review an application to their own committee', async () => {
      const aiOfficer = await f.createUser({ accessType: 'OFFICER', committees: [ai.name] });
      const response = await setStatus(aiOfficer);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.firstChoiceStatus).toBe('accepted');
    });

    test('an admin can review any application', async () => {
      expect((await setStatus(admin)).statusCode).toBe(200);
    });
  });
});
