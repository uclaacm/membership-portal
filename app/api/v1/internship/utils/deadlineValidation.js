function getCommitteeLabel(committee) {
  return committee.displayName || committee.name || committee.id;
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
  findCommitteesPastDeadline,
  buildDeadlineViolationMessage,
  getCommitteeLabel,
};
