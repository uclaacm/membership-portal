/**
 * The canonical committee list.
 *
 * This is the single source of truth for which committees exist. Previously the list was
 * duplicated between the user schema validator and the analytics middleware, which let the
 * two drift apart. Every consumer must import from here.
 *
 * 'Dev Team' is a real committee that officers are assigned to, so it belongs in this list
 * even though it does not host public events the way the other committees do.
 */
const COMMITTEES = [
  'Dev Team',
  'AI',
  'Cloud',
  'Cyber',
  'Design',
  'Hack',
  'ICPC',
  'Studio',
  'TeachLA',
  'W',
];

/**
 * Sentinel used by `event.committee` to mean "general, chapter-wide" rather than owned by any
 * one committee. It is deliberately NOT in COMMITTEES: nobody can be an officer of 'ACM'.
 */
const GENERAL_COMMITTEE = 'ACM';

const isValidCommittee = (committee) => COMMITTEES.includes(committee);

module.exports = { COMMITTEES, GENERAL_COMMITTEE, isValidCommittee };
