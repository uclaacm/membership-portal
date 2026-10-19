import moment from "moment";
import Config from "@/lib/config";

/**
 * One derivation of recruitment state, shared by every surface that reports it.
 *
 * The topbar launcher, the Control Panel's Settings block and its Committees table each used to
 * decide "is recruitment open" for themselves. They disagreed: the launcher had no data at all
 * and read as closed while the internship screens showed every committee accepting
 * applications. Anything that displays cycle state must read it from here.
 */

export interface InternshipCommittee {
  id?: string;
  _id?: string;
  name?: string;
  displayName?: string;
  isActive?: boolean;
  applicationDeadline?: string | null;
}

export interface CycleState {
  /** True when at least one committee is accepting applications. */
  open: boolean;
  openCount: number;
  /** Earliest upcoming deadline, formatted for display, or null. */
  closes: string | null;
  /** Staff-only figure for the launcher's meta line. */
  awaitingReview?: number;
}

/**
 * Committee records are keyed by the canonical name in `Config.committees`, which the API
 * mirrors in `app/committees.js` and the seed in `app/db/dev-setup.js` writes verbatim. There
 * is one list; a record that does not match it is genuinely not set up, not a name to guess at.
 *
 * Comparison is normalised only for case and punctuation, so "TeachLA" and "teach-la" are the
 * same committee. It deliberately does not accept abbreviations: tolerating "Dev" for
 * "Dev Team" is what let the seed drift from the canonical list unnoticed.
 */
const normalize = (value?: string | null) =>
  String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function findCommitteeRecord(
  committees: InternshipCommittee[],
  canonicalName: string,
): InternshipCommittee | null {
  const target = normalize(canonicalName);
  if (!target) return null;

  return (
    (committees ?? []).find(
      (c) => normalize(c.name) === target || normalize(c.displayName) === target,
    ) ?? null
  );
}

export function deriveCycleState(
  committees: InternshipCommittee[],
  awaitingReview?: number,
): CycleState {
  const open = (committees ?? []).filter((c) => c.isActive);

  const nextDeadline = open
    .map((c) => c.applicationDeadline)
    .filter(Boolean)
    .sort()[0];

  return {
    open: open.length > 0,
    openCount: open.length,
    closes: nextDeadline ? moment(nextDeadline).format("MMM D") : null,
    awaitingReview,
  };
}

/** The canonical committee list joined to whatever internship record backs each one. */
export function joinCanonicalCommittees(committees: InternshipCommittee[]) {
  return Config.committees.map((name: string) => ({
    name,
    record: findCommitteeRecord(committees ?? [], name),
  }));
}
