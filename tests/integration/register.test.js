const request = require('supertest');
const jwt = require('jsonwebtoken');

const { server } = require('../..');
const config = require('../../app/config');
const { User, db: Sequelize } = require('../../app/db');
const { API_ROUTE, createFixtures } = require('./helpers');

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  await Sequelize.close();
});

// A new account starts PENDING after the first Google login; adding year and major finishes
// sign-up, activates the account and issues a fresh token.
describe('POST /register', () => {
  const f = createFixtures();
  afterAll(() => f.cleanup());

  const register = (user, body) => request(server)
    .post(`${API_ROUTE}/register`)
    .auth(f.tokenFor(user), { type: 'bearer' })
    .send(body);

  test('activates a pending account and returns a working token', async () => {
    const pending = await f.createUser({ state: 'PENDING', year: 1, major: 'Undeclared' });

    const response = await register(pending, { info: { year: 2, major: 'Mathematics' } });

    expect(response.statusCode).toBe(200);
    const updated = await User.findByUUID(pending.uuid);
    expect(updated.state).toBe('ACTIVE');
    expect(updated.year).toBe(2);
    expect(updated.major).toBe('Mathematics');

    const decoded = jwt.verify(response.body.token, config.session.secret);
    expect(decoded.uuid).toBe(pending.uuid);
    expect(decoded.registered).toBe(true);

    // The new token works on a route that pending accounts can't use.
    const rsvps = await request(server)
      .get(`${API_ROUTE}/rsvp`)
      .auth(response.body.token, { type: 'bearer' });
    expect(rsvps.statusCode).toBe(200);
  });

  test('ignores a year outside 1-5 instead of saving it', async () => {
    const pending = await f.createUser({ state: 'PENDING', year: 1 });

    const response = await register(pending, { info: { year: 9, major: 'Physics' } });

    expect(response.statusCode).toBe(200);
    expect((await User.findByUUID(pending.uuid)).year).toBe(1);
  });

  test('requires the year and major information', async () => {
    const pending = await f.createUser({ state: 'PENDING' });

    const response = await register(pending, {});

    expect(response.statusCode).toBe(400);
    expect((await User.findByUUID(pending.uuid)).state).toBe('PENDING');
  });

  test('an account that is already active cannot register again', async () => {
    const active = await f.createUser();
    const response = await register(active, { info: { year: 4, major: 'History' } });
    expect(response.statusCode).toBe(403);
  });

  test('requires a login', async () => {
    const response = await request(server)
      .post(`${API_ROUTE}/register`)
      .send({ info: { year: 2, major: 'Mathematics' } });
    expect(response.statusCode).toBe(401);
  });
});
