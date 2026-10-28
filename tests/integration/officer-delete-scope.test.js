const request = require('supertest');
const jwt = require('jsonwebtoken');
const { server } = require('../..');
const config = require('../../app/config');
const {
  User, Event, Image, AuditLog, db: Sequelize,
} = require('../../app/db');
const { Committee } = require('../../app/api/v1/internship/models/Committee');

const API_ROUTE = '/app/api/v1';

const unique = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const committeeNames = Object.fromEntries(
  ['Hack', 'AI', 'Design', 'Cyber'].map((name) => [name, unique(`delete-scope-${name}`)]),
);
const createdCommittees = [];
const userUUIDs = [];
const eventUUIDs = [];
const imageUUIDs = [];

const createRecord = async (model, uuids, values) => {
  const record = await model.create(values);
  uuids.push(record.uuid);
  return record;
};

const makeToken = (user) => new Promise((resolve, reject) => {
  jwt.sign(
    {
      uuid: user.getDataValue('uuid'),
      admin: user.isAdmin(),
      superAdmin: user.isSuperAdmin(),
      officer: user.isOfficer(),
      registered: !user.isPending(),
    },
    config.session.secret,
    { expiresIn: 3600 },
    (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    },
  );
});

const createUser = async ({ accessType, committees = [] }) => createRecord(User, userUUIDs, {
  email: `${unique(accessType.toLowerCase())}@test.local`,
  firstName: 'Test',
  lastName: 'User',
  accessType,
  committees: committees.map((name) => committeeNames[name]),
  state: 'ACTIVE',
  year: 3,
  major: 'Computer Science',
  lastActiveAt: new Date(),
});

const createEvent = async ({ committee, cover }) => createRecord(Event, eventUUIDs, {
  committee: committeeNames[committee],
  title: unique(`Event-${committee}`),
  description: 'Scoped deletion test event',
  location: 'Boelter Hall',
  eventLink: 'https://example.com/event',
  startDate: new Date(Date.now() + 86400000),
  endDate: new Date(Date.now() + 90000000),
  attendanceCode: unique(`CODE-${committee}`),
  attendancePoints: 1,
  cover,
});

const createImage = async () => createRecord(Image, imageUUIDs, {
  data: Buffer.from(unique('image-bytes')),
  mimetype: 'image/png',
  size: 16,
});

beforeAll(async () => {
  await Sequelize.sync();
  await Promise.all(Object.values(committeeNames).map(async (name) => {
    createdCommittees.push(await Committee.create({ name, displayName: name }));
  }));
});

beforeEach(() => {
  userUUIDs.length = 0;
  eventUUIDs.length = 0;
  imageUUIDs.length = 0;
});

afterEach(async () => {
  if (eventUUIDs.length) await Event.destroy({ where: { uuid: eventUUIDs } });
  if (imageUUIDs.length) await Image.destroy({ where: { uuid: imageUUIDs } });
  if (userUUIDs.length) {
    await AuditLog.destroy({ where: { actor: userUUIDs } });
    await User.destroy({ where: { uuid: userUUIDs } });
  }
});

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  await Sequelize.close();
});

describe('Committee-scoped delete authorization', () => {
  afterAll(() => Promise.all(createdCommittees.map((committee) => committee.deleteOne())));

  test('Officer can delete event in assigned committee and is forbidden outside it', async () => {
    const officer = await createUser({ accessType: 'OFFICER', committees: ['Hack'] });
    const officerToken = await makeToken(officer);

    const hackEvent = await createEvent({ committee: 'Hack', cover: 'https://example.com/hack.png' });
    const aiEvent = await createEvent({ committee: 'AI', cover: 'https://example.com/ai.png' });

    const allowedDelete = await request(server)
      .delete(`${API_ROUTE}/event/${hackEvent.uuid}`)
      .auth(officerToken, { type: 'bearer' });

    expect(allowedDelete.statusCode).toBe(200);
    expect(allowedDelete.body).toHaveProperty('numDeleted', 1);
    expect(await Event.findByUUID(hackEvent.uuid)).toBeNull();

    const forbiddenDelete = await request(server)
      .delete(`${API_ROUTE}/event/${aiEvent.uuid}`)
      .auth(officerToken, { type: 'bearer' });

    expect(forbiddenDelete.statusCode).toBe(403);
    expect(forbiddenDelete.body.error.message).toMatch(/permission/i);
    expect(await Event.findByUUID(aiEvent.uuid)).not.toBeNull();
  });

  test('Admin can delete any event regardless of committee', async () => {
    const admin = await createUser({ accessType: 'ADMIN' });
    const adminToken = await makeToken(admin);

    const designEvent = await createEvent({ committee: 'Design', cover: 'https://example.com/design.png' });

    const deleteResponse = await request(server)
      .delete(`${API_ROUTE}/event/${designEvent.uuid}`)
      .auth(adminToken, { type: 'bearer' });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body).toHaveProperty('numDeleted', 1);
    expect(await Event.findByUUID(designEvent.uuid)).toBeNull();
  });

  test('Officer can delete image tied to assigned committee and is forbidden outside it', async () => {
    const officer = await createUser({ accessType: 'OFFICER', committees: ['Hack'] });
    const officerToken = await makeToken(officer);

    const hackImage = await createImage();
    const aiImage = await createImage();

    const hackCover = `http://localhost:8080/app/api/v1/image/raw/${hackImage.uuid}`;
    const aiCover = `http://localhost:8080/app/api/v1/image/raw/${aiImage.uuid}`;

    await createEvent({ committee: 'Hack', cover: hackCover });
    await createEvent({ committee: 'AI', cover: aiCover });

    const allowedDelete = await request(server)
      .delete(`${API_ROUTE}/image/raw/${hackImage.uuid}`)
      .auth(officerToken, { type: 'bearer' });

    expect(allowedDelete.statusCode).toBe(200);
    expect((await Image.getImage(hackImage.uuid)).length).toBe(0);

    const forbiddenDelete = await request(server)
      .delete(`${API_ROUTE}/image/raw/${aiImage.uuid}`)
      .auth(officerToken, { type: 'bearer' });

    expect(forbiddenDelete.statusCode).toBe(403);
    expect(forbiddenDelete.body.error.message).toMatch(/permission/i);
    expect((await Image.getImage(aiImage.uuid)).length).toBe(1);
  });

  test('Admin can delete any image regardless of committee', async () => {
    const admin = await createUser({ accessType: 'ADMIN' });
    const adminToken = await makeToken(admin);

    const image = await createImage();
    const cover = `http://localhost:8080/app/api/v1/image/raw/${image.uuid}`;
    await createEvent({ committee: 'Cyber', cover });

    const deleteResponse = await request(server)
      .delete(`${API_ROUTE}/image/raw/${image.uuid}`)
      .auth(adminToken, { type: 'bearer' });

    expect(deleteResponse.statusCode).toBe(200);
    expect((await Image.getImage(image.uuid)).length).toBe(0);
  });
});
