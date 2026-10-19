const error = require('../../../error');

const isOfficerInCommittee = (user, committee) => (
  !!user
  && user.isOfficer()
  && typeof committee === 'string'
  && committee.length > 0
  && user.hasCommittee(committee)
);

const canManageCommitteeResource = (user, committee) => (
  !!user
  && (user.isAdmin() || isOfficerInCommittee(user, committee))
);

const findCommitteesByImageUUID = async (Event, uuid) => {
  if (!uuid) return [];

  const events = await Event.findAll({
    where: {
      cover: {
        $like: `%/image/raw/${uuid}%`,
      },
    },
  });

  // Deduplicate and drop invalid values.
  return [...new Set(events.map((event) => event.committee).filter(Boolean))];
};

const assertCanManageCommitteeResource = (user, committee, resourceLabel) => {
  if (!canManageCommitteeResource(user, committee)) {
    throw new error.Forbidden(`You do not have permission to delete this ${resourceLabel}.`);
  }
};

module.exports = {
  canManageCommitteeResource,
  findCommitteesByImageUUID,
  assertCanManageCommitteeResource,
};
