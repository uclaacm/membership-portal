// Shared fixtures for integration tests. Not a test file itself (Jest only runs *.test.js).
//
// Every helper records what it creates, and cleanup() deletes it again, so each test file can
// share the CI databases with the others without leaving rows behind.
const jwt = require('jsonwebtoken');
const config = require('../../app/config');
const {
  User, Event, Activity, Attendance, RSVP, AuditLog,
} = require('../../app/db');
const { Committee } = require('../../app/api/v1/internship/models/Committee');
const { InternshipApplication } = require('../../app/api/v1/internship/models/InternshipApplication');

const API_ROUTE = '/app/api/v1';

const unique = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const HOUR = 60 * 60 * 1000;

const createFixtures = () => {
  const users = [];
  const events = [];
  const committees = [];

  // accessType: STANDARD | OFFICER | ADMIN | SUPERADMIN. state: ACTIVE | PENDING.
  const createUser = async ({
    accessType = 'STANDARD', state = 'ACTIVE', committees: userCommittees = [], ...rest
  } = {}) => {
    const user = await User.create({
      // A UCLA address, because internship applications reject any other domain.
      email: `${unique(accessType.toLowerCase())}@g.ucla.edu`,
      firstName: 'Test',
      lastName: accessType,
      accessType,
      state,
      year: 3,
      major: 'Computer Science',
      committees: userCommittees,
      ...rest,
    });
    users.push(user);
    return user;
  };

  // Signed the same way the app signs real logins.
  const tokenFor = (user) => jwt.sign(
    { uuid: user.uuid },
    config.session.secret,
    { expiresIn: HOUR / 1000 },
  );

  // By default the event is happening right now, so its attendance code is usable.
  const createEvent = async (values = {}) => {
    const now = Date.now();
    const event = await Event.create({
      title: 'Integration Test Event',
      description: 'Created by an integration test.',
      location: 'Boelter 3400',
      startDate: new Date(now - HOUR),
      endDate: new Date(now + HOUR),
      attendanceCode: unique('code'),
      attendancePoints: 10,
      ...values,
    });
    events.push(event);
    return event;
  };

  const createCommittee = async (values = {}) => {
    const name = values.name || unique('committee');
    const committee = await Committee.create({ name, displayName: name, ...values });
    committees.push(committee);
    return committee;
  };

  const cleanup = async () => {
    const userUUIDs = users.map((user) => user.uuid);
    const eventUUIDs = events.map((event) => event.uuid);
    await Attendance.destroy({ where: { $or: [{ user: userUUIDs }, { event: eventUUIDs }] } });
    await RSVP.destroy({ where: { $or: [{ user: userUUIDs }, { event: eventUUIDs }] } });
    await Activity.destroy({ where: { user: userUUIDs } });
    await AuditLog.destroy({ where: { actor: userUUIDs } });
    await InternshipApplication.deleteMany({ userId: { $in: userUUIDs } });
    await Event.destroy({ where: { uuid: eventUUIDs } });
    await User.destroy({ where: { uuid: userUUIDs } });
    await Committee.deleteMany({ _id: { $in: committees.map((committee) => committee._id) } });
  };

  return {
    createUser, tokenFor, createEvent, createCommittee, cleanup,
  };
};

module.exports = {
  API_ROUTE, HOUR, unique, createFixtures,
};
