jest.mock('../app/logger', () => ({ error: jest.fn() }));
jest.mock('../app/db', () => ({
  Event: {
    findOne: jest.fn(), create: jest.fn(), findByUUID: jest.fn(), destroyByUUID: jest.fn(),
  },
  AuditLog: { create: jest.fn() },
  db: { transaction: jest.fn() },
}));

const Sequelize = require('sequelize');
const { Event, AuditLog, db } = require('../app/db');
const { router } = require('../app/api/v1/membership/event');

// Use the real schema/sanitizer and model instances, without a database connection.
const modelDb = new Sequelize('postgres://localhost/audit_test', { logging: false });
const EventModel = require('../app/db/schema/event')(Sequelize, modelDb);

Event.sanitize = EventModel.sanitize;
const handler = (path, method) => router.stack.find((l) => l.route && l.route.path === path)
  .route.stack.find((s) => s.method === method).handle;
const transaction = { LOCK: { UPDATE: 'UPDATE' } };
let event;
let req;
let res;
let next;

beforeEach(() => {
  jest.clearAllMocks();
  event = EventModel.build({
    uuid: 'f6559765-06f6-4da3-a310-7070ae02338e',
    title: 'TeachLA General Meeting',
    attendancePoints: 20,
    attendanceCode: 'SECRET',
    committee: 'Teach LA',
    startDate: new Date('2026-10-07T02:00:00Z'),
    endDate: new Date('2026-10-07T03:00:00Z'),
    capacity: 60,
  });
  event.update = jest.fn(async (updates) => {
    event.set(updates);
    return event;
  });
  Event.findOne.mockResolvedValue(event);
  Event.findByUUID.mockResolvedValue(event);
  AuditLog.create.mockResolvedValue({});
  db.transaction.mockImplementation(async (callback) => callback(transaction));
  req = {
    params: { uuid: event.uuid },
    body: { event: {} },
    user: { isAdmin: () => true, isOfficer: () => false },
  };
  res = { json: jest.fn() };
  next = jest.fn();
});

it('records old/new values and stable identity, excluding unchanged submitted fields', async () => {
  event.set('attendancePoints', 2147483647);
  req.body.event = { attendancePoints: 20, title: event.title, capacity: '60' };
  await handler('/:uuid', 'patch')(req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({
    action: 'event.update',
    detail: `Event ${event.uuid}; attendancePoints: 2147483647 → 20`,
  }));
  expect(Event.findOne).toHaveBeenCalledWith({
    where: { uuid: event.uuid }, transaction, lock: 'UPDATE',
  });
});

it('does not log no-op edits including equivalent dates and numeric strings', async () => {
  req.body.event = {
    title: event.title,
    attendancePoints: '20',
    capacity: '60',
    startDate: '2026-10-06T19:00:00-07:00',
    attendanceCode: 'SECRET',
    unsupportedField: 'ignored',
  };
  await handler('/:uuid', 'patch')(req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(res.json).toHaveBeenCalled();
  expect(AuditLog.create).not.toHaveBeenCalled();
});

it('records renames, clears, and code changes without exposing codes', async () => {
  req.body.event = { title: 'New title', capacity: '', attendanceCode: 'REPLACEMENT' };
  await handler('/:uuid', 'patch')(req, res, next);
  const entry = AuditLog.create.mock.calls[0][0];
  expect(entry.target).toBe('New title');
  expect(entry.detail).toContain('title: "TeachLA General Meeting" → "New title"');
  expect(entry.detail).toContain('capacity: 60 → null');
  expect(entry.detail).toContain('attendanceCode: changed (redacted)');
  expect(entry.detail).not.toMatch(/SECRET|REPLACEMENT/);
});

it('does not log failed saves or failed commits', async () => {
  req.body.event = { attendancePoints: 35 };
  const failure = new Error('write failed');
  event.update.mockRejectedValueOnce(failure);
  await handler('/:uuid', 'patch')(req, res, next);
  expect(next).toHaveBeenCalledWith(failure);
  expect(AuditLog.create).not.toHaveBeenCalled();
  db.transaction.mockImplementationOnce(async (callback) => {
    await callback(transaction);
    throw failure;
  });
  await handler('/:uuid', 'patch')(req, res, next);
  expect(AuditLog.create).not.toHaveBeenCalled();
});

it('does not log forbidden edits', async () => {
  req.user = { isAdmin: () => false, isOfficer: () => true, hasCommittee: () => false };
  req.body.event = { attendancePoints: 35 };
  await handler('/:uuid', 'patch')(req, res, next);
  expect(next).toHaveBeenCalled();
  expect(event.update).not.toHaveBeenCalled();
  expect(AuditLog.create).not.toHaveBeenCalled();
});

it('captures creation and deletion values with UUIDs, without attendance codes', async () => {
  req.body.event = { title: event.title };
  Event.create.mockResolvedValue(event);
  await handler('/', 'post')(req, res, next);
  Event.destroyByUUID.mockResolvedValue(1);
  await handler('/:uuid', 'delete')(req, res, next);
  expect(next).not.toHaveBeenCalled();
  const entries = AuditLog.create.mock.calls.map(([entry]) => entry);
  expect(entries[0].detail).toContain('attendancePoints: null → 20');
  expect(entries[1].detail).toContain('attendancePoints: 20 → null');
  entries.forEach((entry) => {
    expect(entry.detail).toContain(event.uuid);
    expect(entry.detail).not.toContain('SECRET');
  });
});
