jest.mock('../app/logger', () => ({ error: jest.fn() }));

const { describeChanges, describeEventChanges, recordAudit } = require('../app/audit');

it('omits equivalent numeric and date values but preserves meaningful clears', () => {
  expect(describeEventChanges({
    attendancePoints: 20,
    capacity: 0,
    startDate: new Date('2026-10-07T02:00:00Z'),
    description: 'Hello',
  }, {
    attendancePoints: '20',
    capacity: null,
    startDate: '2026-10-06T19:00:00-07:00',
    description: '',
  })).toBe('capacity: 0 → null; description: "Hello" → ""');
});

it('redacts changed attendance codes and omits unchanged codes', () => {
  expect(describeEventChanges({ attendanceCode: 'OLD' }, { attendanceCode: 'NEW' }))
    .toBe('attendanceCode: changed (redacted)');
  expect(describeEventChanges({ attendanceCode: 'OLD' }, { attendanceCode: 'OLD' })).toBe('');
});

it('compares committee membership independently of order and duplicates', () => {
  expect(describeChanges({ committees: ['Hack', 'AI'] }, {
    committees: ['AI', 'Hack', 'AI'],
  }, ['committees'], { sets: ['committees'] })).toBe('');
});

it('preserves long audit details and actor context', async () => {
  const AuditLog = { create: jest.fn().mockResolvedValue({}) };
  const detail = `description: ${'a'.repeat(400)} → ${'b'.repeat(400)}; attendancePoints: 20 → 35`;
  await recordAudit(AuditLog, {
    user: {
      uuid: 'actor-id', firstName: 'Test', lastName: 'Admin', email: 'admin@test.local',
    },
    ip: '127.0.0.1',
  }, { action: 'event.update', target: 'Meeting', detail });
  expect(AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({
    detail, actor: 'actor-id', actorEmail: 'admin@test.local',
  }));
});
