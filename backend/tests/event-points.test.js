const Sequelize = require('sequelize');

const db = new Sequelize('postgres://localhost/event_points_test', { logging: false });
const Event = require('../app/db/schema/event')(Sequelize, db);

const validEvent = {
  title: 'General Meeting',
  startDate: new Date('2026-10-07T02:00:00Z'),
  endDate: new Date('2026-10-07T03:00:00Z'),
  attendanceCode: 'MEETING',
  attendancePoints: 20,
};

describe('event attendance points limit', () => {
  test.each([0, 20, 499, 500, '500'])('accepts %p points', async (attendancePoints) => {
    const event = Event.build(Event.sanitize({ ...validEvent, attendancePoints }));
    await expect(event.validate()).resolves.toBe(event);
  });

  test.each([501, '501', 2147483647])('rejects creating an event with %p points', async (attendancePoints) => {
    await expect(Event.create(Event.sanitize({ ...validEvent, attendancePoints })))
      .rejects.toThrow('The attendance points must be at most 500');
  });

  test.each([501, '501', 2147483647])('rejects updating an event to %p points', async (attendancePoints) => {
    const event = Event.build({ id: 1, ...validEvent }, { isNewRecord: false });
    await expect(event.update(Event.sanitize({ attendancePoints })))
      .rejects.toThrow('The attendance points must be at most 500');
  });
});
