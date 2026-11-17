const request = require('supertest');

const { server } = require('../..');
const {
  User, Attendance, RSVP, db: Sequelize,
} = require('../../app/db');
const { API_ROUTE, HOUR, createFixtures } = require('./helpers');

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  await Sequelize.close();
});

// Checking in with an event's attendance code is how members earn points.
describe('POST /attendance/attend', () => {
  const f = createFixtures();
  afterAll(() => f.cleanup());

  const attend = (user, attendanceCode) => request(server)
    .post(`${API_ROUTE}/attendance/attend`)
    .auth(f.tokenFor(user), { type: 'bearer' })
    .send({ event: { attendanceCode } });

  const pointsOf = async (user) => (await User.findByUUID(user.uuid)).points;

  test('a correct code during the event awards the points and records attendance', async () => {
    const member = await f.createUser();
    const event = await f.createEvent({ attendancePoints: 25 });

    const response = await attend(member, event.attendanceCode);

    expect(response.statusCode).toBe(200);
    expect(response.body.event.uuid).toBe(event.uuid);
    // Members must never be sent the code itself.
    expect(response.body.event.attendanceCode).toBeUndefined();
    expect(await pointsOf(member)).toBe(25);
    expect(await Attendance.userAttendedEvent(member.uuid, event.uuid)).toBe(true);
  });

  test('checking in also RSVPs the member if they had not already', async () => {
    const member = await f.createUser();
    const event = await f.createEvent();

    await attend(member, event.attendanceCode);

    expect(await RSVP.userRSVPedEvent(member.uuid, event.uuid)).toBe(true);
  });

  test('a second check-in to the same event is rejected and awards nothing', async () => {
    const member = await f.createUser();
    const event = await f.createEvent({ attendancePoints: 10 });

    await attend(member, event.attendanceCode);
    const second = await attend(member, event.attendanceCode);

    // The app reports user mistakes as UserError: HTTP 200 with an error message in the body.
    expect(second.body.error.message).toMatch(/already attended/);
    expect(await pointsOf(member)).toBe(10);
  });

  test('two check-ins sent at the same moment award the points only once', async () => {
    const member = await f.createUser();
    const event = await f.createEvent({ attendancePoints: 10 });

    await Promise.all([attend(member, event.attendanceCode), attend(member, event.attendanceCode)]);

    expect(await Attendance.count({ where: { user: member.uuid, event: event.uuid } })).toBe(1);
    expect(await pointsOf(member)).toBe(10);
  });

  test('a wrong code is rejected', async () => {
    const member = await f.createUser();

    const response = await attend(member, 'not-a-real-code');

    expect(response.body.error.message).toMatch(/didn't work/);
    expect(await pointsOf(member)).toBe(0);
  });

  test('a code is rejected before the event starts', async () => {
    const member = await f.createUser();
    const now = Date.now();
    const event = await f.createEvent({
      startDate: new Date(now + HOUR), endDate: new Date(now + 2 * HOUR),
    });

    const response = await attend(member, event.attendanceCode);

    expect(response.body.error.message).toMatch(/during the event/);
    expect(await pointsOf(member)).toBe(0);
  });

  test('a code is rejected after the event ends', async () => {
    const member = await f.createUser();
    const now = Date.now();
    const event = await f.createEvent({
      startDate: new Date(now - 2 * HOUR), endDate: new Date(now - HOUR),
    });

    const response = await attend(member, event.attendanceCode);

    expect(response.body.error.message).toMatch(/during the event/);
    expect(await pointsOf(member)).toBe(0);
  });

  test('members who have not finished registering cannot check in', async () => {
    const pending = await f.createUser({ state: 'PENDING' });
    const event = await f.createEvent();

    const response = await attend(pending, event.attendanceCode);

    expect(response.statusCode).toBe(403);
    expect(await Attendance.userAttendedEvent(pending.uuid, event.uuid)).toBe(false);
  });

  test('requests without a code are rejected', async () => {
    const member = await f.createUser();

    const response = await request(server)
      .post(`${API_ROUTE}/attendance/attend`)
      .auth(f.tokenFor(member), { type: 'bearer' })
      .send({ event: {} });

    expect(response.statusCode).toBe(400);
  });

  test('requests without a login are rejected', async () => {
    const event = await f.createEvent();

    const response = await request(server)
      .post(`${API_ROUTE}/attendance/attend`)
      .send({ event: { attendanceCode: event.attendanceCode } });

    expect(response.statusCode).toBe(401);
  });
});
