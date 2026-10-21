function getCommitteeLabel(committee) {
  return committee.displayName || committee.name || committee.id;
}

// Derive recruitment status at read time so deadlines take effect without a
// scheduled write, while preserving an administrator's manual closure.
function withRecruitmentStatus(committee, referenceDate = new Date()) {
  const result = typeof committee.toObject === 'function'
    ? committee.toObject()
    : { ...committee };
  if (findCommitteesPastDeadline([result], referenceDate).length > 0) {
    result.isActive = false;
  }
  return result;
}

function findCommitteesPastDeadline(committees, referenceDate = new Date()) {
  return committees.filter((committee) => (
    committee.applicationDeadline
    && new Date(committee.applicationDeadline) <= referenceDate
  ));
}

function buildDeadlineViolationMessage(committees) {
  const labels = committees.map(getCommitteeLabel).join(', ');
  return `Application deadline has passed for: ${labels}`;
}

module.exports = {
  withRecruitmentStatus,
  findCommitteesPastDeadline,
  buildDeadlineViolationMessage,
  getCommitteeLabel,
};
