const request = require('supertest');

const { server } = require('../..');
const { User, db: Sequelize } = require('../../app/db');
const { API_ROUTE, createFixtures } = require('./helpers');

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  await Sequelize.close();
});

// #369: /admin/promote granted ADMIN to any email for anyone holding a password whose hash was
// committed to the repo. Admin roles are now granted only through PATCH /user/:uuid/role.
describe('admin promotion', () => {
  const f = createFixtures();
  let member;
  let admin;

  beforeAll(async () => {
    member = await f.createUser();
    admin = await f.createUser({ accessType: 'ADMIN' });
  });

  afterAll(() => f.cleanup());

  const accessTypeOf = async (user) => {
    const stored = await User.findOne({ where: { uuid: user.uuid } });
    return stored.accessType;
  };

  test('the password-gated /admin/promote route no longer exists', async () => {
    const response = await request(server)
      .post(`${API_ROUTE}/admin/promote`)
      .send({ email: member.email, password: 'anything' });

    expect(response.status).toBe(404);
    expect(await accessTypeOf(member)).toBe('STANDARD');
  });

  test('a member cannot promote themselves through /admin/promote', async () => {
    const response = await request(server)
      .post(`${API_ROUTE}/admin/promote`)
      .auth(f.tokenFor(member), { type: 'bearer' })
      .send({ email: member.email, password: 'anything' });

    expect(response.status).toBe(404);
    expect(await accessTypeOf(member)).toBe('STANDARD');
  });

  test('/admin/promote-officer rejects unauthenticated callers and non-admins', async () => {
    const body = { email: member.email, committees: ['Hack'] };

    const anonymous = await request(server).post(`${API_ROUTE}/admin/promote-officer`).send(body);
    expect(anonymous.status).toBe(401);

    const asMember = await request(server)
      .post(`${API_ROUTE}/admin/promote-officer`)
      .auth(f.tokenFor(member), { type: 'bearer' })
      .send(body);
    expect(asMember.status).toBe(403);

    expect(await accessTypeOf(member)).toBe('STANDARD');
  });

  test('an admin can still grant the admin role through PATCH /user/:uuid/role', async () => {
    const response = await request(server)
      .patch(`${API_ROUTE}/user/${member.uuid}/role`)
      .auth(f.tokenFor(admin), { type: 'bearer' })
      .send({ role: 'Admin' });

    expect(response.status).toBe(200);
    expect(await accessTypeOf(member)).toBe('ADMIN');
  });
});
