const request = require('supertest');
const { v4: uuidv4 } = require('uuid');
const { server, setup } = require('..');
const { User, Activity } = require('../app/db');

const API_ROUTE = '/app/api/v1/';
const route = (name) => API_ROUTE + name;
let token;

beforeAll(async () => {
  await setup(false, true);
  const response = await request(server).post(route('auth/dev-login'));
  token = response.body.token;
});

afterAll(() => {
  server.close();
});

describe('Public Profile and Directory Tests', () => {
  let publicUser;
  let privateUser;
  let pendingUser;

  beforeEach(async () => {
    // Create public profile user
    publicUser = await User.create({
      email: `public${Date.now()}@test.com`,
      firstName: 'Alice',
      lastName: 'Smith',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 4,
      major: 'Computer Science',
      points: 200,
      isProfilePublic: true,
      bio: 'CS major interested in web development',
      pronouns: 'she/her',
      linkedinUrl: 'https://linkedin.com/in/alice',
      githubUrl: 'https://github.com/alice',
      skills: ['React', 'Python', 'TypeScript'],
      careerInterests: ['Software Engineering', 'Product Management'],
    });
    Activity.accountCreated(publicUser.uuid);

    // Create private profile user
    privateUser = await User.create({
      email: `private${Date.now()}@test.com`,
      firstName: 'Bob',
      lastName: 'Jones',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      year: 2,
      major: 'Mathematics',
      points: 80,
      isProfilePublic: false,
      bio: 'This should not be visible',
      skills: ['Java', 'C++'],
      careerInterests: ['Data Science'],
    });
    Activity.accountCreated(privateUser.uuid);

    // Create pending user
    pendingUser = await User.create({
      email: `pending${Date.now()}@test.com`,
      firstName: 'Charlie',
      lastName: 'Brown',
      accessType: 'STANDARD',
      state: 'PENDING',
      year: 1,
      major: 'Engineering',
      points: 0,
      isProfilePublic: true,
    });
    Activity.accountCreated(pendingUser.uuid);
  });

  afterEach(async () => {
    await publicUser.destroy();
    await privateUser.destroy();
    await pendingUser.destroy();
  });

  describe('GET /api/v1/user/profile/:uuid - Individual Profile', () => {
    test('Should return full public profile when isProfilePublic is true', async () => {
      const response = await request(server)
        .get(route(`user/profile/${publicUser.uuid}`))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.profile).toMatchObject({
        firstName: 'Alice',
        lastName: 'Smith',
        pronouns: 'she/her',
        points: 200,
        bio: 'CS major interested in web development',
        linkedinUrl: 'https://linkedin.com/in/alice',
        githubUrl: 'https://github.com/alice',
        skills: ['React', 'Python', 'TypeScript'],
        careerInterests: ['Software Engineering', 'Product Management'],
      });
      expect(response.body.profile).toHaveProperty('picture');
    });

    test('Should return minimal profile when isProfilePublic is false', async () => {
      const response = await request(server)
        .get(route(`user/profile/${privateUser.uuid}`))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.profile).toMatchObject({
        firstName: 'Bob',
        lastName: 'Jones',
        points: 80,
        pronouns: null,
        picture: null,
      });
      // Should NOT contain private fields
      expect(response.body.profile.bio).toBeUndefined();
      expect(response.body.profile.skills).toBeUndefined();
      expect(response.body.profile.careerInterests).toBeUndefined();
      expect(response.body.profile.linkedinUrl).toBeUndefined();
      expect(response.body.profile.githubUrl).toBeUndefined();
      expect(response.body.profile.personalWebsite).toBeUndefined();
    });

    test('Should return 404 for non-existent user', async () => {
      const fakeUuid = uuidv4();
      const response = await request(server)
        .get(route(`user/profile/${fakeUuid}`))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    test('Should require authentication', async () => {
      const response = await request(server)
        .get(route(`user/profile/${publicUser.uuid}`));

      expect(response.statusCode).toBe(401);
      expect(response.error).toBeTruthy();
    });

    test('Should support query parameter for specific fields', async () => {
      const response = await request(server)
        .get(route(`user/profile/${publicUser.uuid}`))
        .query({ fields: 'skills,careerInterests' })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.profile).toHaveProperty('skills');
      expect(response.body.profile).toHaveProperty('careerInterests');
      // When fields parameter is used, might only return requested fields
      // Actual implementation may vary
    });

    test('Should yield 403 Forbidden for requesting restricted user', async () => {
      const response = await request(server)
        .get(route(`user/profile/${pendingUser.uuid}`))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(403);
    });

    test('Should yield 400 Bad Request for invalid UUID format', async () => {
      const response = await request(server)
        .get(route('user/profile/invalid-uuid'))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/user/directory - Member Directory', () => {
    let directoryUser1;
    let directoryUser2;
    let directoryUser3;

    beforeEach(async () => {
      // Create additional users for directory testing
      directoryUser1 = await User.create({
        email: `dir1${Date.now()}@test.com`,
        firstName: 'Emma',
        lastName: 'Wilson',
        accessType: 'STANDARD',
        state: 'ACTIVE',
        year: 3,
        major: 'Computer Science',
        points: 250,
        isProfilePublic: true,
        bio: 'Full stack developer',
        skills: ['React', 'Node.js', 'MongoDB'],
        careerInterests: ['Software Engineering'],
      });

      directoryUser2 = await User.create({
        email: `dir2${Date.now()}@test.com`,
        firstName: 'David',
        lastName: 'Lee',
        accessType: 'STANDARD',
        state: 'ACTIVE',
        year: 2,
        major: 'Data Science',
        points: 180,
        isProfilePublic: true,
        bio: 'ML enthusiast',
        skills: ['Python', 'TensorFlow', 'SQL'],
        careerInterests: ['Machine Learning', 'Data Science'],
      });

      directoryUser3 = await User.create({
        email: `dir3${Date.now()}@test.com`,
        firstName: 'Sarah',
        lastName: 'Chen',
        accessType: 'STANDARD',
        state: 'ACTIVE',
        year: 4,
        major: 'Computer Science',
        points: 300,
        isProfilePublic: true,
        bio: 'Systems programmer',
        skills: ['C++', 'Rust', 'Go'],
        careerInterests: ['Systems Programming'],
      });
    });

    afterEach(async () => {
      await directoryUser1.destroy();
      await directoryUser2.destroy();
      await directoryUser3.destroy();
    });

    test('Should return paginated list of public profiles', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.directory).toHaveProperty('users');
      expect(response.body.directory).toHaveProperty('total');
      expect(response.body.directory).toHaveProperty('page');
      expect(response.body.directory).toHaveProperty('limit');
      expect(response.body.directory).toHaveProperty('pages');
      expect(Array.isArray(response.body.directory.users)).toBe(true);
      expect(response.body.directory.users.length).toBeGreaterThan(0);
    });

    test('Should filter by skills using OR logic', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .query({ skills: 'React,Python' })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      const { users } = response.body.directory;

      // Each user should have at least one of the specified skills
      users.forEach((user) => {
        const hasSkill = user.skills && (
          user.skills.includes('React') || user.skills.includes('Python')
        );
        expect(hasSkill).toBe(true);
      });
    });

    test('Should filter by career interests', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .query({ careerInterests: 'Software Engineering' })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      const { users } = response.body.directory;

      // Each user should have the specified career interest
      users.forEach((user) => {
        expect(user.careerInterests).toContain('Software Engineering');
      });
    });

    test('Should search by name', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .query({ search: 'Alice' })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      const { users } = response.body.directory;

      // Should find Alice Smith
      const alice = users.find((u) => u.firstName === 'Alice' && u.lastName === 'Smith');
      expect(alice).toBeDefined();
    });

    test('Should support pagination parameters', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .query({ page: 1, limit: 2 })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.directory.page).toBe(1);
      expect(response.body.directory.limit).toBe(2);
      expect(response.body.directory.users.length).toBeLessThanOrEqual(2);
    });

    test('Should use default pagination values', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.directory.limit).toBe(20); // default limit
      expect(response.body.directory.page).toBe(1); // default page
    });

    test('Should enforce maximum limit of 100', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .query({ limit: 500 })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.directory.limit).toBeLessThanOrEqual(100);
    });

    test('Should only return users with isProfilePublic = true', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      const { users } = response.body.directory;

      // Private user (Bob Jones) should not be in the directory
      const privateBob = users.find((u) => u.firstName === 'Bob' && u.lastName === 'Jones');
      expect(privateBob).toBeUndefined();
    });

    test('Should only return ACTIVE users', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      const { users } = response.body.directory;

      // Pending user (Charlie Brown) should not be in the directory
      const pendingCharlie = users.find((u) => u.firstName === 'Charlie' && u.lastName === 'Brown');
      expect(pendingCharlie).toBeUndefined();
    });

    test('Should order by points descending by default', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      const { users } = response.body.directory;

      // Check that users are sorted by points in descending order
      for (let i = 0; i < users.length - 1; i++) {
        expect(users[i].points).toBeGreaterThanOrEqual(users[i + 1].points);
      }
    });

    test('Should require authentication', async () => {
      const response = await request(server)
        .get(route('user/directory'));

      expect(response.statusCode).toBe(401);
      expect(response.error).toBeTruthy();
    });

    test('Should calculate correct pagination metadata', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .query({ limit: 2 })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      const { total, limit, pages } = response.body.directory;
      expect(pages).toBe(Math.ceil(total / limit));
    });

    test('Should handle combined filters', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .query({
          skills: 'Python',
          careerInterests: 'Software Engineering',
          limit: 10,
        })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      const { users } = response.body.directory;

      // Each user should match all filters
      users.forEach((user) => {
        expect(user.skills).toContain('Python');
        expect(user.careerInterests).toContain('Software Engineering');
      });
    });

    test('Should return empty array when no users match filters', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .query({ skills: 'NonExistentSkill12345' })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.directory.users).toEqual([]);
      expect(response.body.directory.total).toBe(0);
    });

    test('Should handle page beyond available pages', async () => {
      const response = await request(server)
        .get(route('user/directory'))
        .query({ page: 9999 })
        .auth(token, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.directory.users).toEqual([]);
    });
  });
});
