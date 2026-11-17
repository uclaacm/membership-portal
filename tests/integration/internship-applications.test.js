const request = require('supertest');

const { server } = require('../..');
const { db: Sequelize } = require('../../app/db');
const { Committee } = require('../../app/api/v1/internship/models/Committee');
const { API_ROUTE, createFixtures } = require('./helpers');

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  await Sequelize.close();
});

// An applicant creates a draft, fills it in, and submits it. Everything goes through the real
// routes, so the input validation middleware runs too (unit tests call the controllers directly).
describe('internship applications', () => {
  const f = createFixtures();
  let committee;
  let otherCommittee;

  const nextWeek = () => new Date(Date.now() + 7 * 24 * 3600 * 1000);

  beforeAll(async () => {
    committee = await f.createCommittee({
      applicationDeadline: nextWeek(),
      customQuestions: [
        {
          questionKey: 'why', questionText: 'Why do you want to join?', questionType: 'long_text', required: true,
        },
        {
          questionKey: 'level',
          questionText: 'Experience level?',
          questionType: 'multiple_choice',
          required: false,
          choices: ['beginner', 'experienced'],
        },
      ],
    });
    otherCommittee = await f.createCommittee({ applicationDeadline: nextWeek() });
  });

  afterAll(() => f.cleanup());

  const api = (user) => ({
    create: (body) => request(server).post(`${API_ROUTE}/internship/applications`).auth(f.tokenFor(user), { type: 'bearer' }).send(body),
    update: (id, body) => request(server).put(`${API_ROUTE}/internship/applications/${id}`).auth(f.tokenFor(user), { type: 'bearer' }).send(body),
    submit: (id) => request(server).post(`${API_ROUTE}/internship/applications/${id}/submit`).auth(f.tokenFor(user), { type: 'bearer' }),
    remove: (id) => request(server).delete(`${API_ROUTE}/internship/applications/${id}`).auth(f.tokenFor(user), { type: 'bearer' }),
    mine: () => request(server).get(`${API_ROUTE}/internship/applications/me`).auth(f.tokenFor(user), { type: 'bearer' }),
  });

  const validDraft = () => ({
    university: 'UCLA',
    major: 'Computer Science',
    graduationYear: 2028,
    firstChoiceCommittee: committee.id,
  });

  const createDraft = async () => {
    const applicant = await f.createUser();
    const response = await api(applicant).create(validDraft());
    expect(response.statusCode).toBe(201);
    return { applicant, id: response.body.data._id };
  };

  describe('the happy path', () => {
    test('create a draft, fill it in, submit it', async () => {
      const applicant = await f.createUser();
      const as = api(applicant);

      const created = await as.create(validDraft());
      expect(created.statusCode).toBe(201);
      expect(created.body.data.submissionStatus).toBe('draft');
      // Identity comes from the account, not the request body.
      expect(created.body.data.email).toBe(applicant.email);
      const { _id: id } = created.body.data;

      const mine = await as.mine();
      expect(mine.statusCode).toBe(200);
      expect(mine.body.submissionStatus).toBe('draft');

      const updated = await as.update(id, {
        resumeUrl: 'https://example.com/resume.pdf',
        firstChoiceResponses: [{ questionKey: 'why', question: 'Why do you want to join?', answer: 'To build things.' }],
      });
      expect(updated.statusCode).toBe(200);

      const submitted = await as.submit(id);
      expect(submitted.statusCode).toBe(200);
      expect(submitted.body.data.submissionStatus).toBe('submitted');
    });

    test('an applicant can only have one application per cycle', async () => {
      const { applicant } = await createDraft();
      const second = await api(applicant).create(validDraft());
      expect(second.statusCode).toBe(409);
    });
  });

  describe('input validation', () => {
    const expectRejected = async (body, messagePattern) => {
      const applicant = await f.createUser();
      const response = await api(applicant).create(body);
      expect(response.statusCode).toBe(400);
      const messages = (response.body.errors || []).map((e) => e.msg).join(' | ');
      expect(messages || response.body.message).toMatch(messagePattern);
    };

    test('university and major are required', async () => {
      const { university, major, ...rest } = validDraft();
      await expectRejected(rest, /University is required/);
    });

    test('graduation years before 2020 are rejected', async () => {
      await expectRejected({ ...validDraft(), graduationYear: 2010 }, /Graduation year/);
    });

    test('reviewer-only fields cannot be set by the applicant', async () => {
      await expectRejected({ ...validDraft(), firstChoiceStatus: 'accepted' }, /managed by reviewers/);
    });

    test('identity fields cannot be spoofed', async () => {
      await expectRejected({ ...validDraft(), email: 'someone.else@g.ucla.edu' }, /set automatically/);
    });

    test('the same committee cannot be chosen twice', async () => {
      await expectRejected(
        { ...validDraft(), secondChoiceCommittee: committee.id },
        /same committee twice/,
      );
    });

    test('answers must belong to the chosen committee\'s questions', async () => {
      await expectRejected({
        ...validDraft(),
        firstChoiceResponses: [{ questionKey: 'made-up', question: 'Made up?', answer: 'yes' }],
      }, /invalid question keys/);
    });

    test('multiple-choice answers must be one of the choices', async () => {
      await expectRejected({
        ...validDraft(),
        firstChoiceResponses: [{ questionKey: 'level', question: 'Experience level?', answer: 'wizard' }],
      }, /invalid choices/);
    });

    test('committees that are not recruiting are rejected', async () => {
      const closed = await f.createCommittee({ isActive: false });
      await expectRejected({ ...validDraft(), firstChoiceCommittee: closed.id }, /not currently accepting/);
    });

    test('committees past their deadline are rejected', async () => {
      const expired = await f.createCommittee({ applicationDeadline: new Date(Date.now() - 1000) });
      await expectRejected({ ...validDraft(), firstChoiceCommittee: expired.id }, /deadline/);
    });
  });

  describe('submitting', () => {
    test('a draft without a resume cannot be submitted', async () => {
      const { applicant, id } = await createDraft();
      const response = await api(applicant).submit(id);
      expect(response.statusCode).toBe(400);
      expect(response.body.missingFields).toEqual(['Resume']);
    });

    test('a draft missing a required answer cannot be submitted', async () => {
      const { applicant, id } = await createDraft();
      await api(applicant).update(id, { resumeUrl: 'https://example.com/resume.pdf' });

      const response = await api(applicant).submit(id);

      expect(response.statusCode).toBe(400);
      expect(response.body.missingFields[0]).toMatch(/Why do you want to join/);
    });

    test('a draft cannot be submitted after the committee deadline passes', async () => {
      const { applicant, id } = await createDraft();
      await api(applicant).update(id, {
        resumeUrl: 'https://example.com/resume.pdf',
        firstChoiceResponses: [{ questionKey: 'why', question: 'Why?', answer: 'Because.' }],
      });
      // Close the deadline after the draft exists.
      const lateCommittee = await f.createCommittee({ applicationDeadline: nextWeek() });
      await api(applicant).update(id, {
        firstChoiceCommittee: lateCommittee.id, firstChoiceResponses: [],
      });
      await Committee.updateOne(
        { _id: lateCommittee._id },
        { applicationDeadline: new Date(Date.now() - 1000) },
      );

      const response = await api(applicant).submit(id);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/deadline/i);
    });

    test('a submitted application cannot be edited, resubmitted or deleted by the applicant', async () => {
      const { applicant, id } = await createDraft();
      await api(applicant).update(id, {
        resumeUrl: 'https://example.com/resume.pdf',
        firstChoiceResponses: [{ questionKey: 'why', question: 'Why?', answer: 'Because.' }],
      });
      expect((await api(applicant).submit(id)).statusCode).toBe(200);

      expect((await api(applicant).update(id, { major: 'Changed' })).statusCode).toBe(403);
      expect((await api(applicant).submit(id)).statusCode).toBe(400);
      expect((await api(applicant).remove(id)).statusCode).toBe(403);
    });
  });

  describe('ownership', () => {
    test("another member cannot edit, submit or delete someone else's draft", async () => {
      const { id } = await createDraft();
      const stranger = await f.createUser();

      expect((await api(stranger).update(id, { major: 'Hijacked' })).statusCode).toBe(403);
      expect((await api(stranger).submit(id)).statusCode).toBe(403);
      expect((await api(stranger).remove(id)).statusCode).toBe(403);
    });

    test('the applicant can delete their own draft', async () => {
      const { applicant, id } = await createDraft();
      expect((await api(applicant).remove(id)).statusCode).toBe(200);
    });

    test('a member cannot list all applications', async () => {
      const member = await f.createUser();
      const response = await request(server)
        .get(`${API_ROUTE}/internship/applications`)
        .auth(f.tokenFor(member), { type: 'bearer' });
      expect(response.statusCode).toBe(403);
    });
  });

  test('choosing a second committee works alongside the first', async () => {
    const applicant = await f.createUser();
    const response = await api(applicant).create({
      ...validDraft(), secondChoiceCommittee: otherCommittee.id,
    });
    expect(response.statusCode).toBe(201);
    expect(String(response.body.data.secondChoiceCommittee)).toBe(otherCommittee.id);
  });
});
