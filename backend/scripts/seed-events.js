/**
 * Seeds a spread of realistic events, for staging.
 *
 * Staging runs the *prod* compose stack, so `app/db/dev-setup.js` — which is gated on
 * `config.isDevelopment` — never fires there. That left staging with an empty events page and
 * nothing to exercise the dashboard, filter bar, or check-in flow against. This script fills
 * that gap and is safe to run against dev too.
 *
 * Idempotent: events are keyed on `attendanceCode`, which the schema already forces to be
 * unique. Re-running updates the existing rows in place rather than stacking duplicates, so
 * this can be re-run after a schema change without a wipe.
 *
 * Usage:
 *   node scripts/seed-events.js            # seed (or refresh) every event below
 *   node scripts/seed-events.js --dry-run  # print the plan, touch nothing
 *   node scripts/seed-events.js --prune    # also retire seeded events dropped from this file
 *
 * Dates are computed relative to the run time so the set always straddles "now" — some past
 * events for the leaderboard and attendance history, some upcoming ones for RSVP and featured
 * cards. A fixed calendar would have gone stale the week after it was written.
 */

const { db, Event } = require('../app/db');

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

// Every seeded row carries this prefix in its attendance code. It is what makes --prune able
// to tell "seeded by this script" from "created by a human on staging", which must never be
// deleted out from under someone.
//
// Deliberately not the bare 'seed-' that app/db/dev-setup.js uses for its `seed-<n>` rows:
// a shared prefix would make --prune sweep away the dev seed too.
const SEED_PREFIX = 'seed-evt-';

const at = (dayOffset, hour, durationHours) => {
  const start = new Date(Date.now() + dayOffset * DAY);
  start.setHours(hour, 0, 0, 0);
  return { startDate: start, endDate: new Date(start.getTime() + durationHours * HOUR) };
};

const EVENTS = [
  // ---- past: gives the leaderboard, profile activity, and "earlier events" something to show
  {
    code: 'ai-kickoff',
    title: 'AI Kickoff: Intro to Neural Networks',
    committee: 'AI',
    location: 'Boelter 3400',
    description: 'A hands-on introduction to neural networks — no ML background needed. We build a digit classifier from scratch and talk through what each layer is actually doing.',
    ...at(-21, 18, 2),
    attendancePoints: 10,
    capacity: 80,
  },
  {
    code: 'hack-portfolio-night',
    title: 'Hack: Portfolio Night',
    committee: 'Hack',
    location: 'Engineering VI 289',
    description: 'Bring a half-finished project and leave with a deployed one. Officers float between tables for code review, deployment help, and README triage.',
    ...at(-14, 19, 3),
    attendancePoints: 10,
    capacity: 60,
  },
  {
    code: 'cyber-ctf-fall',
    title: 'Cyber: Fall CTF',
    committee: 'Cyber',
    location: 'Kaplan A51',
    description: 'A beginner-friendly capture-the-flag across web, crypto, and forensics. Teams of up to four; prizes for the top three boards.',
    ...at(-10, 17, 4),
    attendancePoints: 15,
    capacity: 100,
  },
  {
    code: 'w-mentorship-mixer',
    title: 'ACM-W Mentorship Mixer',
    committee: 'W',
    location: 'Powell Library Rotunda',
    description: 'Speed-mentoring with alumni across product, research, and infra. Mentees are matched by interest area beforehand.',
    ...at(-7, 18, 2),
    attendancePoints: 10,
    capacity: 50,
  },
  {
    code: 'icpc-practice-2',
    title: 'ICPC Practice Contest #2',
    committee: 'ICPC',
    location: 'Boelter 5249',
    description: 'Five problems, three hours, contest conditions. Editorial walkthrough afterwards for anyone who wants it.',
    ...at(-3, 13, 3),
    attendancePoints: 10,
    capacity: 40,
  },

  // ---- imminent: exercises the "happening soon" and check-in paths
  {
    code: 'acm-general-fall',
    title: 'ACM Fall General Meeting',
    committee: 'ACM',
    location: 'Northwest Campus Auditorium',
    description: 'Every committee introduces what they are building this quarter, followed by open Q&A and food. The single best event to come to if you are new.',
    ...at(1, 18, 2),
    attendancePoints: 20,
    capacity: 300,
  },
  {
    code: 'teachla-curriculum-jam',
    title: 'TeachLA Curriculum Jam',
    committee: 'TeachLA',
    location: 'Moore 100',
    description: 'Write and test a K-12 CS lesson in one sitting. Pairs are matched so every lesson gets a first reader before it ships.',
    ...at(3, 17, 3),
    attendancePoints: 10,
    capacity: 45,
  },

  // ---- upcoming: RSVP, capacity meters, featured cards
  {
    code: 'design-systems-workshop',
    title: 'Design: Building a Design System',
    committee: 'Design',
    location: 'Broad Art Center 2160E',
    description: 'Tokens, components, and the handoff to code. We take a messy Figma file and turn it into something a developer can actually build from.',
    ...at(7, 18, 2),
    attendancePoints: 10,
    capacity: 55,
  },
  {
    code: 'cloud-k8s-lab',
    title: 'Cloud: Kubernetes from Zero',
    committee: 'Cloud',
    location: 'Engineering IV 18-162',
    description: 'Deploy a real service to a cluster, break it, and watch it heal. Bring a laptop with Docker installed.',
    ...at(10, 18, 3),
    attendancePoints: 15,
    capacity: 40,
  },
  {
    code: 'studio-game-jam',
    title: 'Studio: 48-Hour Game Jam',
    committee: 'Studio',
    location: 'Kerckhoff Grand Salon',
    description: 'A weekend-long jam with a theme revealed at kickoff. Teams form on site; every finished game gets played at the showcase.',
    ...at(14, 10, 12),
    attendancePoints: 25,
    capacity: 120,
  },
  {
    code: 'ai-research-panel',
    title: 'AI: Research Panel with UCLA Faculty',
    committee: 'AI',
    location: 'Royce 190',
    description: 'Faculty from the vision and NLP groups on how to actually get into a lab as an undergrad, and what they wish applicants knew.',
    ...at(21, 17, 2),
    attendancePoints: 10,
    capacity: 150,
  },
  {
    code: 'hack-demo-day',
    title: 'Hack: End-of-Quarter Demo Day',
    committee: 'Hack',
    location: 'Covel Commons Grand Horizon',
    description: 'Every Hack project team demos what they shipped this quarter. Open to the whole chapter; judges award a best-in-show.',
    ...at(28, 18, 3),
    attendancePoints: 15,
    capacity: 200,
  },
];

const buildRow = (event) => ({
  attendanceCode: `${SEED_PREFIX}${event.code}`,
  title: event.title,
  committee: event.committee,
  organization: 'ACM',
  location: event.location,
  description: event.description,
  startDate: event.startDate,
  endDate: event.endDate,
  attendancePoints: event.attendancePoints,
  capacity: event.capacity,
  // No cover, matching app/db/dev-setup.js: the card then falls back to the committee banner,
  // which is the path most real events actually take.
  deleted: false,
});

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const prune = process.argv.includes('--prune');

  const rows = EVENTS.map(buildRow);

  if (dryRun) {
    rows.forEach((row) => {
      const when = row.startDate.toISOString().slice(0, 16).replace('T', ' ');
      process.stdout.write(`  ${when}  ${row.committee.padEnd(8)} ${row.title}\n`);
    });
    process.stdout.write(`\n${rows.length} events would be seeded. No changes made.\n`);
    return;
  }

  let created = 0;
  let updated = 0;

  // Sequential rather than Promise.all: these are upserts keyed on a unique column, and
  // running them concurrently against the same index is how you get spurious unique
  // violations under Postgres' default isolation. Chained through reduce because the lint
  // config disallows for..of.
  await rows.reduce(async (previous, row) => {
    await previous;
    const existing = await Event.findOne({ where: { attendanceCode: row.attendanceCode } });
    if (existing) {
      await existing.update(row);
      updated += 1;
      return null;
    }
    await Event.create(row);
    created += 1;
    return null;
  }, Promise.resolve());

  let pruned = 0;
  if (prune) {
    const keep = rows.map((row) => row.attendanceCode);
    const stale = (await Event.findAll({ where: { deleted: false } })).filter((event) => {
      const code = event.getDataValue('attendanceCode');
      return code.startsWith(SEED_PREFIX) && !keep.includes(code);
    });
    // Soft delete, matching how the API retires events — a hard delete would orphan any
    // attendance rows that already point at it.
    await stale.reduce(async (previous, event) => {
      await previous;
      await event.update({ deleted: true });
      pruned += 1;
      return null;
    }, Promise.resolve());
  }

  process.stdout.write(`Seeded events: ${created} created, ${updated} updated${prune ? `, ${pruned} pruned` : ''}.\n`);
}

main()
  .then(() => db.close())
  .then(() => process.exit(0))
  .catch((err) => {
    process.stderr.write(`Failed to seed events: ${err.message}\n`);
    process.exit(1);
  });
