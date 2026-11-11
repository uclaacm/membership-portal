const request = require('supertest');

const { server } = require('../..');
const { RSVP, db: Sequelize } = require('../../app/db');
const { API_ROUTE, HOUR, createFixtures } = require('./helpers');

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  await Sequelize.close();
});

describe('RSVPs', () => {
  const f = createFixtures();
  afterAll(() => f.cleanup());

  const upcoming = () => {
    const now = Date.now();
    return f.createEvent({
      startDate: new Date(now + 24 * HOUR), endDate: new Date(now + 25 * HOUR),
    });
  };

  const as = (user) => {
    const authed = (req) => req.auth(f.tokenFor(user), { type: 'bearer' });
    return {
      add: (eventUUID) => authed(request(server).post(`${API_ROUTE}/rsvp/add`))
        .send({ event: { uuid: eventUUID } }),
      cancel: (eventUUID) => authed(request(server).delete(`${API_ROUTE}/rsvp/${eventUUID}`)),
      mine: () => authed(request(server).get(`${API_ROUTE}/rsvp`)),
    };
  };

  test('a member can RSVP to an upcoming event and see it in their list', async () => {
    const member = await f.createUser();
    const event = await upcoming();

    const response = await as(member).add(event.uuid);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    const mine = await as(member).mine();
    expect(mine.body.rsvps.map((r) => r.event)).toContain(event.uuid);
  });

  test('RSVPing twice to the same event is rejected', async () => {
    const member = await f.createUser();
    const event = await upcoming();

    await as(member).add(event.uuid);
    const second = await as(member).add(event.uuid);

    // UserError: HTTP 200 with an error message in the body.
    expect(second.body.error.message).toMatch(/already RSVPed/);
    expect(await RSVP.count({ where: { user: member.uuid, event: event.uuid } })).toBe(1);
  });

  test('a member can cancel their RSVP', async () => {
    const member = await f.createUser();
    const event = await upcoming();
    await as(member).add(event.uuid);

    const response = await as(member).cancel(event.uuid);

    expect(response.body.success).toBe(true);
    expect(await RSVP.userRSVPedEvent(member.uuid, event.uuid)).toBe(false);
  });

  test('cancelling an RSVP that does not exist is rejected', async () => {
    const member = await f.createUser();
    const event = await upcoming();
    const response = await as(member).cancel(event.uuid);
    expect(response.body.error.message).toMatch(/have not RSVPed/);
  });

  test('cancelling only removes your own RSVP', async () => {
    const member = await f.createUser();
    const other = await f.createUser();
    const event = await upcoming();
    await as(member).add(event.uuid);
    await as(other).add(event.uuid);

    await as(member).cancel(event.uuid);

    expect(await RSVP.userRSVPedEvent(other.uuid, event.uuid)).toBe(true);
  });

  test('you cannot RSVP to or cancel for an event that has already started', async () => {
    const member = await f.createUser();
    const started = await f.createEvent();

    expect((await as(member).add(started.uuid)).body.error.message).toMatch(/already started/);
    expect((await as(member).cancel(started.uuid)).body.error.message).toMatch(/already started/);
  });

  test('RSVPing to an event that does not exist is rejected', async () => {
    const member = await f.createUser();
    const response = await as(member).add('00000000-0000-4000-8000-000000000000');
    expect(response.body.error.message).toMatch(/not found/);
  });

  test('an event uuid is required', async () => {
    const member = await f.createUser();
    const response = await request(server)
      .post(`${API_ROUTE}/rsvp/add`)
      .auth(f.tokenFor(member), { type: 'bearer' })
      .send({});
    expect(response.statusCode).toBe(400);
  });

  test('members who have not finished registering cannot RSVP', async () => {
    const pending = await f.createUser({ state: 'PENDING' });
    const event = await upcoming();
    expect((await as(pending).add(event.uuid)).statusCode).toBe(403);
    expect((await as(pending).mine()).statusCode).toBe(403);
  });

  test('capacity is advisory: RSVPs beyond it are still accepted', async () => {
    const now = Date.now();
    const event = await f.createEvent({
      capacity: 1, startDate: new Date(now + 24 * HOUR), endDate: new Date(now + 25 * HOUR),
    });
    const first = await f.createUser();
    const second = await f.createUser();

    await as(first).add(event.uuid);
    const response = await as(second).add(event.uuid);

    expect(response.body.success).toBe(true);
  });
});
