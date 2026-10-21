jest.mock('../app/api/v1/internship/models/InternshipApplication', () => ({
  InternshipApplication: { find: jest.fn(), countDocuments: jest.fn() },
}));
jest.mock('../app/api/v1/internship/models/Committee', () => ({
  Committee: { find: jest.fn() },
}));

const { InternshipApplication } = require('../app/api/v1/internship/models/InternshipApplication');
const { Committee } = require('../app/api/v1/internship/models/Committee');
const { getAllApplications } = require('../app/api/v1/internship/controllers/applicationController');

const choices = ['firstChoice', 'secondChoice', 'thirdChoice'];
let application;

beforeEach(() => {
  jest.clearAllMocks();
  application = { firstName: 'Applicant', coverLetter: 'Shared cover letter' };
  choices.forEach((choice, index) => {
    Object.assign(application, {
      [`${choice}Committee`]: `committee-${index}`,
      [`${choice}Status`]: 'accepted',
      [`${choice}Responses`]: [{ questionKey: 'why', question: 'Why?', answer: `Answer ${index}` }],
      [`${choice}Officer1Rating`]: 'yes',
      [`${choice}Officer2Rating`]: 'no',
      [`${choice}Notes`]: `Private notes ${index}`,
    });
  });
  InternshipApplication.find.mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([application]),
  });
  InternshipApplication.countDocuments.mockResolvedValue(1);
  Committee.find.mockReturnValue({
    select: jest.fn().mockResolvedValue(choices.map((choice, index) => ({
      id: `committee-${index}`, name: `Team ${index}`,
    }))),
  });
});

async function fetchApplications({ admin = false, committees = [] } = {}) {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  await getAllApplications({
    user: { isAdmin: () => admin, isOfficer: () => true, committees },
    query: {},
  }, res);
  return res.json.mock.calls[0][0];
}

test('admins receive every choice, answer, decision and review even with officer privileges', async () => {
  const result = await fetchApplications({ admin: true, committees: ['Team 0'] });
  expect(result.data).toEqual([application]);
  expect(Committee.find).not.toHaveBeenCalled();
});

test.each([0, 1, 2])('officers receive only their committee choice in slot %i', async (ownedIndex) => {
  const result = await fetchApplications({ committees: [` TEAM ${ownedIndex} `] });
  expect(InternshipApplication.find).toHaveBeenCalledWith(expect.objectContaining({
    $or: choices.map(choice => ({ [`${choice}Committee`]: { $in: [`committee-${ownedIndex}`] } })),
    submissionStatus: 'submitted',
  }));
  const exported = result.data[0];
  expect(exported.coverLetter).toBe(application.coverLetter);
  choices.forEach((choice, index) => {
    if (index === ownedIndex) {
      Object.keys(application).filter(key => key.startsWith(choice)).forEach(key => {
        expect(exported[key]).toEqual(application[key]);
      });
    } else {
      expect(exported[`${choice}Committee`]).toBeNull();
      expect(exported[`${choice}Status`]).toBeNull();
      expect(exported[`${choice}Responses`]).toEqual([]);
      expect(exported[`${choice}Officer1Rating`]).toBeNull();
      expect(exported[`${choice}Officer2Rating`]).toBeNull();
      expect(exported[`${choice}Notes`]).toBe('');
      expect(application[`${choice}Notes`]).toBe(`Private notes ${index}`);
    }
  });
});

test('officers assigned multiple committees retain each owned choice', async () => {
  const result = await fetchApplications({ committees: ['Team 0', 'Team 2'] });
  expect(result.data[0].firstChoiceResponses).toEqual(application.firstChoiceResponses);
  expect(result.data[0].thirdChoiceResponses).toEqual(application.thirdChoiceResponses);
  expect(result.data[0].secondChoiceResponses).toEqual([]);
});

test('officers without committee assignments receive no applications', async () => {
  expect((await fetchApplications()).data).toEqual([]);
  expect(InternshipApplication.find).not.toHaveBeenCalled();
});
