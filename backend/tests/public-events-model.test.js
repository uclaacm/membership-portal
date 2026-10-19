/**
 * Exercises the real Event serializer and finders.
 *
 * The route tests mock app/db, so they verify the router's behaviour against a stand-in. The
 * two pieces that actually decide what the public can reach — the getPublicApi allow-list and
 * the `deleted: false` clause — live on the model, so they are pinned here against the real
 * implementation rather than a mirror of it.
 */

const Sequelize = require('sequelize');

// The schema module only needs `define` to hand back something it can hang methods on.
const loadEventModel = () => {
  let defined;
  const db = {
    define: (name, attributes, options) => {
      defined = { name, attributes, options };
      // A function, not a plain object: the schema module hangs instance methods off
      // `.prototype`, which only exists on a callable — same shape as a real Sequelize model.
      return function EventModel() {};
    },
  };
  const Event = require('../app/db/schema/event')(Sequelize, db); // eslint-disable-line global-require
  return { Event, defined };
};

// Stands in for a loaded row: getPublicApi reads exclusively through getDataValue.
const rowInstance = (values) => ({
  getDataValue: (key) => values[key],
});

describe('Event.prototype.getPublicApi', () => {
  const ALL_COLUMNS = {
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

  test('emits exactly the allow-listed fields and nothing else', () => {
    const { Event } = loadEventModel();
    const out = Event.prototype.getPublicApi.call(rowInstance(ALL_COLUMNS));

    expect(Object.keys(out).sort()).toEqual([
      'attendancePoints', 'committee', 'cover', 'description', 'endDate',
      'eventLink', 'location', 'startDate', 'title', 'uuid',
    ]);
  });

  test('cannot be argued into leaking the attendance code', () => {
    const { Event } = loadEventModel();
    const instance = rowInstance(ALL_COLUMNS);

    // getPublic(true) is the authenticated serializer and does hand back the code. The public
    // one takes no arguments, so no caller — or future refactor that passes something along —
    // can flip it open.
    [undefined, true, 'admin', 1, {}].forEach((arg) => {
      const out = Event.prototype.getPublicApi.call(instance, arg);
      expect(out.attendanceCode).toBeUndefined();
      expect(JSON.stringify(out)).not.toContain('SUPERSECRET2026');
    });
  });

  test('withholds the operational signals this API deliberately does not publish', () => {
    const { Event } = loadEventModel();
    const out = Event.prototype.getPublicApi.call(rowInstance(ALL_COLUMNS));

    expect(out.capacity).toBeUndefined();
    expect(out.rsvpCount).toBeUndefined();
    expect(out.id).toBeUndefined();
    expect(out.deleted).toBeUndefined();
    expect(out.thumb).toBeUndefined();
    expect(out.organization).toBeUndefined();
  });

  test('every column on the table is either published or consciously withheld', () => {
    const { Event, defined } = loadEventModel();
    const published = Object.keys(Event.prototype.getPublicApi.call(rowInstance(ALL_COLUMNS)));

    // Withholding is the default, so this list is the record of that decision. A new column
    // fails here until someone states which side it belongs on — which is the point: the
    // failure lands on whoever adds the column, not on whoever later notices it in a response.
    const WITHHELD = [
      'id', 'organization', 'thumb', 'attendanceCode', 'capacity', 'deleted',
    ];

    const columns = Object.keys(defined.attributes);
    expect([...published, ...WITHHELD].sort()).toEqual(columns.sort());
  });
});

describe('Event.getPublicEvents', () => {
  const capture = () => {
    const { Event } = loadEventModel();
    const calls = [];
    Event.findAndCountAll = (args) => {
      calls.push(args);
      return Promise.resolve({ rows: [], count: 0 });
    };
    return { Event, calls };
  };

  test('always excludes deleted rows', async () => {
    const { Event, calls } = capture();
    await Event.getPublicEvents();
    expect(calls[0].where.deleted).toBe(false);
  });

  test('keeps the deleted filter even when every other filter is supplied', async () => {
    const { Event, calls } = capture();
    await Event.getPublicEvents({
      committee: 'Hack', from: new Date('2026-09-01'), to: new Date('2026-09-30'), offset: 10, limit: 5,
    });

    const { where, offset, limit } = calls[0];
    expect(where.deleted).toBe(false);
    expect(where.committee).toBe('Hack');
    expect(where.startDate[Sequelize.Op.gte]).toEqual(new Date('2026-09-01'));
    expect(where.startDate[Sequelize.Op.lte]).toEqual(new Date('2026-09-30'));
    expect(offset).toBe(10);
    expect(limit).toBe(5);
  });

  test('orders chronologically and defaults to a bounded page', async () => {
    const { Event, calls } = capture();
    await Event.getPublicEvents();

    expect(calls[0].order).toEqual([['startDate', 'ASC']]);
    expect(calls[0].offset).toBe(0);
    expect(calls[0].limit).toBe(50);
  });

  test('omits the date clause entirely when no bounds are given', async () => {
    const { Event, calls } = capture();
    await Event.getPublicEvents({ committee: 'Hack' });
    expect(calls[0].where.startDate).toBeUndefined();
  });

  test('accepts a lower bound alone', async () => {
    const { Event, calls } = capture();
    await Event.getPublicEvents({ from: new Date('2026-09-01') });

    expect(calls[0].where.startDate[Sequelize.Op.gte]).toEqual(new Date('2026-09-01'));
    expect(calls[0].where.startDate[Sequelize.Op.lte]).toBeUndefined();
  });
});

describe('Event.findPublicByUUID', () => {
  test('will not return a deleted event', async () => {
    const { Event } = loadEventModel();
    const calls = [];
    Event.findOne = (args) => { calls.push(args); return Promise.resolve(null); };

    await Event.findPublicByUUID('e1b9c0de-0000-4000-8000-000000000001');

    expect(calls[0].where.uuid).toBe('e1b9c0de-0000-4000-8000-000000000001');
    expect(calls[0].where.deleted).toBe(false);
  });
});
