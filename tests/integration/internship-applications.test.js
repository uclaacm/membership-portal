const request = require('supertest');

const { server } = require('../..');
const { db: Sequelize } = require('../../app/db');
const { Committee } = require('../../app/api/v1/internship/models/Committee');
const { API_ROUTE, createFixtures } = require('./helpers');

// Smallest thing the upload accepts: the PDF header plus a little body.
const PDF = Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n');

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
    uploadResume: (id, file = PDF, { filename = 'resume.pdf', contentType = 'application/pdf' } = {}) => request(server)
      .put(`${API_ROUTE}/internship/applications/${id}/resume`)
      .auth(f.tokenFor(user), { type: 'bearer' })
      .attach('resume', file, { filename, contentType }),
    getResume: (id) => request(server).get(`${API_ROUTE}/internship/applications/${id}/resume`).auth(f.tokenFor(user), { type: 'bearer' }),
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
        firstChoiceResponses: [{ questionKey: 'why', question: 'Why do you want to join?', answer: 'To build things.' }],
      });
      expect(updated.statusCode).toBe(200);

      const uploaded = await as.uploadResume(id);
      expect(uploaded.statusCode).toBe(200);
      expect(uploaded.body.data.resume).toMatchObject({ originalName: 'resume.pdf', size: PDF.length });

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
      await api(applicant).uploadResume(id);

      const response = await api(applicant).submit(id);

      expect(response.statusCode).toBe(400);
      expect(response.body.missingFields[0]).toMatch(/Why do you want to join/);
    });

    test('a draft cannot be submitted after the committee deadline passes', async () => {
      const { applicant, id } = await createDraft();
      await api(applicant).uploadResume(id);
      await api(applicant).update(id, {
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
      await api(applicant).uploadResume(id);
      await api(applicant).update(id, {
        firstChoiceResponses: [{ questionKey: 'why', question: 'Why?', answer: 'Because.' }],
      });
      expect((await api(applicant).submit(id)).statusCode).toBe(200);

      expect((await api(applicant).update(id, { major: 'Changed' })).statusCode).toBe(403);
      expect((await api(applicant).uploadResume(id)).statusCode).toBe(403);
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

  describe('resumes', () => {
    test('the applicant gets back exactly the PDF they uploaded', async () => {
      const { applicant, id } = await createDraft();
      const uploaded = await api(applicant).uploadResume(id, PDF, { filename: "Ada's Résumé (final).pdf" });
      expect(uploaded.statusCode).toBe(200);
      expect(uploaded.body.data.resume.originalName).toBe("Ada's Résumé (final).pdf");

      const response = await api(applicant).getResume(id).buffer(true);

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['content-disposition']).toBe(
        'inline; filename="Ada_s R_sum_ _final_.pdf"; '
        + "filename*=UTF-8''Ada%27s%20R%C3%A9sum%C3%A9%20%28final%29.pdf",
      );
      expect(Buffer.compare(response.body, PDF)).toBe(0);
    });

    test('uploading again replaces the previous resume', async () => {
      const { applicant, id } = await createDraft();
      await api(applicant).uploadResume(id);
      const replacement = Buffer.concat([PDF, Buffer.from('% revised\n')]);
      const second = await api(applicant).uploadResume(id, replacement, { filename: 'v2.pdf' });
      expect(second.body.data.resume.originalName).toBe('v2.pdf');

      const response = await api(applicant).getResume(id).buffer(true);
      expect(Buffer.compare(response.body, replacement)).toBe(0);
    });

    test('files that are not PDFs are rejected', async () => {
      const { applicant, id } = await createDraft();

      const wrongType = await api(applicant).uploadResume(id, PDF, { filename: 'r.docx', contentType: 'application/msword' });
      expect(wrongType.statusCode).toBe(400);
      expect(wrongType.body.message).toMatch(/PDF/);

      // Claims to be a PDF, but the bytes say otherwise.
      const disguised = await api(applicant).uploadResume(id, Buffer.from('<html><script>alert(1)</script></html>'));
      expect(disguised.statusCode).toBe(400);
      expect(disguised.body.message).toMatch(/PDF/);
    });

    test('files over 5 MB are rejected with the limit in the message', async () => {
      const { applicant, id } = await createDraft();
      const tooBig = Buffer.concat([PDF, Buffer.alloc(5 * 1024 * 1024)]);
      const response = await api(applicant).uploadResume(id, tooBig);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/5 MB/);
    });

    test("nobody else can upload to someone's application", async () => {
      const { id } = await createDraft();
      const stranger = await f.createUser();
      expect((await api(stranger).uploadResume(id)).statusCode).toBe(403);
    });

    test('only officers of a chosen committee (and admins) can view the resume', async () => {
      const { applicant, id } = await createDraft();
      await api(applicant).uploadResume(id);

      const stranger = await f.createUser();
      const ownOfficer = await f.createUser({ accessType: 'OFFICER', committees: [committee.name] });
      const otherOfficer = await f.createUser({ accessType: 'OFFICER', committees: [otherCommittee.name] });
      const admin = await f.createUser({ accessType: 'ADMIN' });

      expect((await api(stranger).getResume(id)).statusCode).toBe(403);
      expect((await api(otherOfficer).getResume(id)).statusCode).toBe(403);
      expect((await api(ownOfficer).getResume(id)).statusCode).toBe(200);
      expect((await api(admin).getResume(id)).statusCode).toBe(200);
    });

    test('viewing requires signing in', async () => {
      const { applicant, id } = await createDraft();
      await api(applicant).uploadResume(id);
      const response = await request(server).get(`${API_ROUTE}/internship/applications/${id}/resume`);
      expect(response.statusCode).toBe(401);
    });

    test('a resume link can no longer be set through the update route', async () => {
      const { applicant, id } = await createDraft();
      const response = await api(applicant).update(id, { resumeUrl: 'https://example.com/resume.pdf' });
      expect(response.statusCode).toBe(200);
      expect(response.body.data.resumeUrl).toBeUndefined();
      expect((await api(applicant).submit(id)).body.missingFields).toEqual(['Resume']);
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
