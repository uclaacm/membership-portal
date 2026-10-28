const error = require('../../app/error');
const {
  canManageCommitteeResource,
  assertCanManageCommitteeResource,
  findCommitteesByImageUUID,
} = require('../../app/api/v1/auth/committeeScope');

const officer = {
  isAdmin: () => false,
  isOfficer: () => true,
  hasCommittee: (committee) => committee === 'Hack',
};
const admin = {
  isAdmin: () => true,
  isOfficer: () => false,
};
const member = {
  isAdmin: () => false,
  isOfficer: () => false,
};

describe('committee-scoped deletion permissions', () => {
  test.each([
    [officer, 'Hack', true],
    [officer, 'AI', false],
    [officer, '', false],
    [officer, null, false],
    [admin, 'AI', true],
    [member, 'Hack', false],
    [null, 'Hack', false],
  ])('canManageCommitteeResource(%p, %p) is %p', (user, committee, allowed) => {
    expect(canManageCommitteeResource(user, committee)).toBe(allowed);
  });

  test('rejects an officer outside their committee before deleting an event', () => {
    expect(() => assertCanManageCommitteeResource(officer, 'AI', 'event'))
      .toThrow(error.Forbidden);
    expect(() => assertCanManageCommitteeResource(officer, 'Hack', 'event'))
      .not.toThrow();
  });

  test('looks up image references and returns distinct valid committee names', async () => {
    const Event = {
      findAll: jest.fn().mockResolvedValue([
        { committee: 'Hack' },
        { committee: 'Hack' },
        { committee: 'AI' },
        { committee: '' },
      ]),
    };

    await expect(findCommitteesByImageUUID(Event, 'image-id'))
      .resolves.toEqual(['Hack', 'AI']);
    expect(Event.findAll).toHaveBeenCalledWith({
      where: { cover: { $like: '%/image/raw/image-id%' } },
    });
    expect(['Hack', 'AI'].every((committee) => canManageCommitteeResource(officer, committee)))
      .toBe(false);
  });

  test('does not query events without an image UUID', async () => {
    const Event = { findAll: jest.fn() };

    await expect(findCommitteesByImageUUID(Event, '')).resolves.toEqual([]);
    expect(Event.findAll).not.toHaveBeenCalled();
  });
});
