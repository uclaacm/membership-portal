jest.mock('../app/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
}));

jest.mock('../app/db', () => ({
  Event: {
    getPublicEvents: jest.fn(),
    findPublicByUUID: jest.fn(),
  },
}));

const { Event } = require('../app/db');
const { router } = require('../app/api/v1/public/events');
const error = require('../app/error');

// Every field the event table carries, so a test can assert on what is *absent* from a
// response rather than only on what is present. attendanceCode is the one that matters: it is
// the check-in secret, and leaking it lets anyone claim points without attending.
const FULL_ROW = {
  id: 42,
  uuid: 'e1b9c0de-0000-4000-8000-000000000001',
  organization: 'ACM',
  committee: 'Hack',
  thumb: 'https://example.com/thumb.png',
  cover: 'https://example.com/cover.png',
  title: 'Hack Night',
  description: 'Come build things.',
  location: 'Boelter 4760',
  eventLink: 'https://example.com/rsvp',
  startDate: new Date('2026-09-10T01:00:00Z'),
  endDate: new Date('2026-09-10T03:00:00Z'),
  attendanceCode: 'SUPERSECRET2026',
  attendancePoints: 10,
  capacity: 60,
  deleted: false,
};

// Mirrors the real Event.prototype.getPublicApi allow-list. Built from FULL_ROW so that a
// field added to the model without being added to the serializer shows up here as absent.
const PUBLIC_FIELDS = [
  'uuid', 'title', 'description', 'committee', 'location',
  'cover', 'eventLink', 'startDate', 'endDate', 'attendancePoints',
];

const makeEvent = (overrides = {}) => {
  const row = { ...FULL_ROW, ...overrides };
  return {
    ...row,
    getPublicApi: () => Object.fromEntries(PUBLIC_FIELDS.map((f) => [f, row[f]])),
  };
};

// Minimal express plumbing: pull the handler off the router layer and call it directly, the
// way the other controller tests in this suite do.
const handlerFor = (path, method = 'get') => {
  const layer = router.stack.find((l) => l.route && l.route.path === path);
  if (!layer) throw new Error(`no route registered for ${path}`);
  return layer.route.stack.find((s) => s.method === method).handle;
};

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const invoke = async (path, req, method = 'get') => {
  const res = mockRes();
  const next = jest.fn();
  await handlerFor(path, method)({ query: {}, params: {}, ...req }, res, next);
  return { res, next };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /public/events — what leaves the perimeter', () => {
  test('never serves the attendance code, and serves only the allow-listed fields', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [makeEvent()], count: 1 });

    const { res } = await invoke('/', {});
    const [payload] = res.json.mock.calls[0];
    const [event] = payload.events;

    expect(event.attendanceCode).toBeUndefined();
    expect(JSON.stringify(payload)).not.toContain('SUPERSECRET2026');

    // Operational signals the ticket deliberately withheld.
    expect(event.rsvpCount).toBeUndefined();
    expect(event.capacity).toBeUndefined();
    // Internals.
    expect(event.id).toBeUndefined();
    expect(event.deleted).toBeUndefined();

    expect(Object.keys(event).sort()).toEqual([...PUBLIC_FIELDS].sort());
  });

  test('excludes deleted events at the query level', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [], count: 0 });
    await invoke('/', {});
    // The finder owns the `deleted: false` clause; assert the route delegates to it rather
    // than to a finder that would return every row.
    expect(Event.getPublicEvents).toHaveBeenCalledTimes(1);
  });

  test('rewrites Google Drive cover links into embeddable URLs', async () => {
    Event.getPublicEvents.mockResolvedValue({
      rows: [makeEvent({ cover: 'https://drive.google.com/file/d/ABC123/view?usp=sharing' })],
      count: 1,
    });

    const { res } = await invoke('/', {});
    expect(res.json.mock.calls[0][0].events[0].cover)
      .toBe('https://drive.google.com/thumbnail?id=ABC123&sz=s1000');
  });
});

describe('GET /public/events — filtering and paging', () => {
  test('passes committee and date bounds through to the finder', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [], count: 0 });

    await invoke('/', {
      query: {
        committee: 'Hack', from: '2026-09-01', to: '2026-09-30', offset: '25', limit: '10',
      },
    });

    const args = Event.getPublicEvents.mock.calls[0][0];
    expect(args.committee).toBe('Hack');
    expect(args.from).toEqual(new Date('2026-09-01'));
    expect(args.to).toEqual(new Date('2026-09-30'));
    expect(args.offset).toBe(25);
    expect(args.limit).toBe(10);
  });

  test('defaults to the first page of 50', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [], count: 0 });
    await invoke('/', {});

    const args = Event.getPublicEvents.mock.calls[0][0];
    expect(args.offset).toBe(0);
    expect(args.limit).toBe(50);
  });

  test('reports the unpaged total so a consumer can page without guessing', async () => {
    Event.getPublicEvents.mockResolvedValue({ rows: [makeEvent()], count: 137 });

    const { res } = await invoke('/', { query: { limit: '1' } });
    const [payload] = res.json.mock.calls[0];

    expect(payload.total).toBe(137);
    expect(payload.events).toHaveLength(1);
    expect(payload.limit).toBe(1);
  });

  test.each([
    ['limit above the cap', { limit: '5000' }],
    ['limit of zero', { limit: '0' }],
    ['negative offset', { offset: '-1' }],
    ['non-numeric limit', { limit: 'all' }],
    ['unparseable date', { from: 'next tuesday' }],
    ['inverted range', { from: '2026-09-30', to: '2026-09-01' }],
  ])('rejects %s with 400 instead of a plausible-looking page', async (_label, query) => {
    Event.getPublicEvents.mockResolvedValue({ rows: [], count: 0 });

    const { next } = await invoke('/', { query });

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(error.BadRequest);
    // A malformed filter must not reach the database as a silently-empty query.
    expect(Event.getPublicEvents).not.toHaveBeenCalled();
  });
});

describe('GET /public/events/:uuid', () => {
  test('serves a single event through the same allow-list', async () => {
    Event.findPublicByUUID.mockResolvedValue(makeEvent());

    const { res } = await invoke('/:uuid', { params: { uuid: FULL_ROW.uuid } });
    const [payload] = res.json.mock.calls[0];

    expect(payload.event.uuid).toBe(FULL_ROW.uuid);
    expect(payload.event.attendanceCode).toBeUndefined();
    expect(Object.keys(payload.event).sort()).toEqual([...PUBLIC_FIELDS].sort());
  });

  test('404s for an unknown or deleted event', async () => {
    Event.findPublicByUUID.mockResolvedValue(null);

    const { res, next } = await invoke('/:uuid', { params: { uuid: 'missing' } });

    expect(res.json).not.toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toBeInstanceOf(error.NotFound);
    // Same response either way — an outside consumer has no business learning that a uuid
    // used to exist.
    expect(next.mock.calls[0][0].message).toBe('Event not found');
  });
});
