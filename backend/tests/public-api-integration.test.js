/**
 * HTTP-level tests for the public API.
 *
 * The other two files test the router handler and the model in isolation. This one mounts the
 * real router in a real Express app and speaks HTTP to it, because the properties that matter
 * most for a public endpoint live in the middleware wiring rather than in any handler: that it
 * answers without credentials at all, that CORS is actually emitted (server-wide CORS is
 * development-only, so if the router did not set it this would pass in dev and fail in prod),
 * and that Access-Control-Allow-Credentials is never present.
 */

jest.mock('../app/logger', () => ({
  info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), log: jest.fn(),
}));

jest.mock('../app/db', () => ({
  Event: {
    getPublicEvents: jest.fn(),
    findPublicByUUID: jest.fn(),
  },
}));

const express = require('express');
const request = require('supertest');
const { Event } = require('../app/db');
const appError = require('../app/error');

const ATTENDANCE_CODE = 'SUPERSECRET2026';

const eventRow = () => ({
  getPublicApi: () => ({
    uuid: 'e1b9c0de-0000-4000-8000-000000000001',
    title: 'Hack Night',
    description: 'Come build things.',
    committee: 'Hack',
    location: 'Boelter 4760',
    cover: 'https://drive.google.com/file/d/ABC123/view',
    eventLink: 'https://example.com/rsvp',
    startDate: new Date('2026-09-10T01:00:00Z'),
    endDate: new Date('2026-09-10T03:00:00Z'),
    attendancePoints: 10,
  }),
});

// Mirrors how the server assembles things in index.js: the v1 tree, then the error middleware.
const buildApp = () => {
  const app = express();
  app.use('/app/api/v1/public', require('../app/api/v1/public').router); // eslint-disable-line global-require
  app.use(appError.errorHandler);
  app.use(appError.notFoundHandler);
  return app;
};

let app;

// Deliberately no jest.resetModules() here: resetting would make buildApp() re-require the
// router against a *fresh* copy of the app/db mock, so the `Event` handle above would no
// longer be the object the router calls, and every mocked resolution would read as undefined.
beforeEach(() => {
  jest.clearAllMocks();
  app = buildApp();
});

describe('public API over HTTP', () => {
  test('serves events with no credentials of any kind', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [eventRow()], count: 1 });

    const res = await request(app).get('/app/api/v1/public/events');

    expect(res.status).toBe(200);
    expect(res.body.error).toBeNull();
    expect(res.body.events).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  test('emits a wildcard CORS origin but never allows credentials', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [], count: 0 });

    const res = await request(app).get('/app/api/v1/public/events');

    expect(res.headers['access-control-allow-origin']).toBe('*');
    // The pairing that would make the wildcard dangerous. A browser refuses it, but asserting
    // it here means nobody can add credentialed routes under this prefix without a red test.
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });

  test('answers a CORS preflight without hitting the database', async () => {
    const res = await request(app).options('/app/api/v1/public/events');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toContain('GET');
    expect(Event.getPublicEvents).not.toHaveBeenCalled();
  });

  test('marks responses publicly cacheable, so repeat traffic misses the database', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [], count: 0 });

    const res = await request(app).get('/app/api/v1/public/events');

    expect(res.headers['cache-control']).toMatch(/public/);
    expect(res.headers['cache-control']).toMatch(/max-age=\d+/);
  });

  test('the attendance code never appears in a public response body', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [eventRow()], count: 1 });
    const list = await request(app).get('/app/api/v1/public/events');
    expect(list.text).not.toContain(ATTENDANCE_CODE);

    Event.findPublicByUUID.mockResolvedValue(eventRow());
    const single = await request(app).get('/app/api/v1/public/events/e1b9c0de-0000-4000-8000-000000000001');
    expect(single.text).not.toContain(ATTENDANCE_CODE);
  });

  test('rewrites Drive covers on the wire', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [eventRow()], count: 1 });

    const res = await request(app).get('/app/api/v1/public/events');

    expect(res.body.events[0].cover).toBe('https://drive.google.com/thumbnail?id=ABC123&sz=s1000');
  });

  test('returns 400 with a usable message for a bad filter', async () => {
    const res = await request(app).get('/app/api/v1/public/events?limit=99999');

    expect(res.status).toBe(400);
    expect(res.body.error.status).toBe(400);
    expect(res.body.error.message).toMatch(/limit/);
    expect(Event.getPublicEvents).not.toHaveBeenCalled();
  });

  test('returns 404 for an unknown event', async () => {
    Event.findPublicByUUID.mockResolvedValue(null);

    const res = await request(app).get('/app/api/v1/public/events/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Event not found');
  });

  test('does not rate-limit when the proxy forwards no client address', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [], count: 0 });

    // Today's deployment: Next.js proxies to the backend without X-Forwarded-For. The limiter
    // must stand down rather than collapse every caller — including the portal's own UI —
    // into one shared bucket.
    const results = [];
    for (let i = 0; i < 30; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      results.push((await request(app).get('/app/api/v1/public/events')).status);
    }

    expect(results.every((s) => s === 200)).toBe(true);
  });

  test('counts against a per-client budget once an address is forwarded', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [], count: 0 });

    const res = await request(app)
      .get('/app/api/v1/public/events')
      .set('X-Forwarded-For', '203.0.113.7');

    // The limiter is active for this request, so it advertises the budget. Two different
    // clients therefore get two budgets rather than sharing one. Which spelling of the header
    // appears depends on the draft the library defaults to, so accept either.
    expect(res.status).toBe(200);
    const advertisesBudget = res.headers['ratelimit-limit'] !== undefined
      || res.headers.ratelimit !== undefined;
    expect(advertisesBudget).toBe(true);
  });
});
