/**
 * One-time migration that makes the Committee collection the only committee list.
 *
 * Before this, committees were also hardcoded in app/committees.js and the UI's config.ts, and
 * officers were assigned from those lists. Any officer whose committee had no matching Committee
 * record (or whose record had a different name) got "Could not find a committee matching ...".
 *
 * This script:
 *   1. Renames the 'Dev' record to 'Dev Team', the name officers, events and banners already use.
 *      Applications reference committees by _id, so they are unaffected.
 *   2. Rewrites officer/event references that differ from a record only in case or spacing
 *      (e.g. 'w' -> 'W') to the record's exact name.
 *   3. Creates an inactive record for any other committee name an officer or event uses that has
 *      no record, so every existing reference resolves. Inactive means applicants don't see it.
 *   4. Copies the colors and banners that used to live in config.ts onto each record, leaving any
 *      value an admin has already set.
 *
 * Dry run by default; prints the plan and changes nothing. Pass --apply to write.
 *   node scripts/migrate-committees-to-db.js
 *   node scripts/migrate-committees-to-db.js --apply
 */
// A one-off, sequential CLI script: it reports to the console and deliberately runs each
// write in order so the printed plan matches what happened.
/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue */
/* eslint-disable no-underscore-dangle */
require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const { db } = require('../app/db');
const { Committee } = require('../app/api/v1/internship/models/Committee');
const { GENERAL_COMMITTEE } = require('../app/committees');

const mongoUri = process.env.MONGODB_URI
  || `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=admin`;

const apply = process.argv.includes('--apply');

const RENAMES = { Dev: 'Dev Team' };

// The styling formerly hardcoded in membership-portal-ui/lib/config.ts.
const LEGACY_STYLES = {
  'Dev Team': { color: '#3b59ed', bannerUrl: '/event_banners/acm_dev_banner.webp' },
  AI: { color: '#28b2fd', bannerUrl: '/event_banners/acm_ai_banner.webp' },
  Cyber: { color: '#ffba43', bannerUrl: '/event_banners/acm_cyber_banner.png' },
  Design: { color: '#fe833d', bannerUrl: '/event_banners/acm_design_banner.webp' },
  Hack: { color: '#c95ffd', bannerUrl: '/event_banners/acm_hack_banner.webp' },
  ICPC: { color: '#ff6b6b', bannerUrl: '/event_banners/acm_icpc_banner.webp' },
  Studio: { color: '#ed3267', bannerUrl: '/event_banners/acm_studio_banner.webp' },
  TeachLA: { color: '#5fda10', bannerUrl: '/event_banners/acm_teachla_banner.webp' },
  W: { color: '#01d4cb', bannerUrl: '/event_banners/acm_w_banner.webp' },
  Cloud: { color: '#9f97ff', bannerUrl: '/event_banners/acm_cloud_banner.webp' },
};

const normalize = (name) => name.trim().toLowerCase();

async function referencedCommitteeNames() {
  const [rows] = await db.query(`
    SELECT 'officer' AS source, c AS name, COUNT(*)::int AS count
      FROM users, unnest(committees) AS c GROUP BY c
    UNION ALL
    SELECT 'event', committee, COUNT(*)::int
      FROM events WHERE committee IS NOT NULL AND committee <> '' GROUP BY committee
  `);
  return rows;
}

async function main() {
  await db.authenticate();
  await mongoose.connect(mongoUri);
  console.log(apply ? '== APPLYING ==' : '== DRY RUN (pass --apply to write) ==');

  // Every record keyed by the name it will have after renames.
  const records = new Map();
  (await Committee.find({})).forEach((committee) => {
    records.set(RENAMES[committee.name] || committee.name, committee);
  });

  // 1. Renames
  for (const [from, to] of Object.entries(RENAMES)) {
    const source = await Committee.findOne({ name: from });
    if (!source) {
      console.log(`rename    '${from}' -> '${to}': skipped, no '${from}' record`);
    } else if (await Committee.exists({ name: to })) {
      throw new Error(`Both '${from}' and '${to}' records exist; merge them by hand first.`);
    } else {
      console.log(`rename    '${from}' -> '${to}'`);
      // `name` is immutable through the model, so write to the collection directly.
      if (apply) {
        await Committee.collection.updateOne(
          { _id: source._id },
          { $set: { name: to, displayName: to } },
        );
      }
    }
  }

  // 2 & 3. Reconcile officer and event references
  const byNormalized = new Map([...records.keys()].map((name) => [normalize(name), name]));
  const missing = new Map();
  for (const { source, name, count } of await referencedCommitteeNames()) {
    if (!name || name === GENERAL_COMMITTEE || records.has(name)) continue;

    const canonical = byNormalized.get(normalize(name));
    if (canonical) {
      console.log(`fix ref   ${count} ${source}(s): '${name}' -> '${canonical}'`);
      if (apply && source === 'officer') {
        await db.query(
          'UPDATE users SET committees = array_replace(committees, :name, :canonical) WHERE :name = ANY(committees)',
          { replacements: { name, canonical } },
        );
      } else if (apply) {
        await db.query('UPDATE events SET committee = :canonical WHERE committee = :name', { replacements: { name, canonical } });
      }
      continue;
    }

    const entry = missing.get(name) || { officer: 0, event: 0 };
    entry[source] += count;
    missing.set(name, entry);
  }

  if (missing.size === 0) console.log('backfill  nothing to create; every officer and event committee has a record');
  for (const [name, { officer, event }] of missing) {
    console.log(`backfill  create inactive '${name}' (used by ${officer} officer(s), ${event} event(s))`);
    if (apply) {
      await Committee.create({
        name, displayName: name, isActive: false, ...(LEGACY_STYLES[name] || {}),
      });
    }
  }

  // 4. Styling
  for (const [name, style] of Object.entries(LEGACY_STYLES)) {
    const committee = records.get(name);
    if (!committee) continue; // created above with its style, or never existed
    const set = {};
    if (!committee.color) set.color = style.color;
    if (!committee.bannerUrl) set.bannerUrl = style.bannerUrl;
    if (Object.keys(set).length === 0) continue;
    console.log(`style     '${name}': ${Object.entries(set).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    if (apply) await Committee.updateOne({ _id: committee._id }, { $set: set });
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
