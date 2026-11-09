const express = require('express');
const error = require('../../../error');
const { Event } = require('../../../db');
const { normalizeCover } = require('../../../event-cover');

const router = express.Router();

// Bounded so a consumer cannot ask for the entire event history in one request. The default
// is a page a listing page would actually render; the max is what a calendar view spanning a
// wide date range needs.
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// Committee names are free-form strings on the event row rather than a foreign key, so this
// only guards against unbounded input, not against unknown names — an unknown committee
// legitimately returns an empty list rather than an error.
const MAX_COMMITTEE_LENGTH = 255;

// `uuid` is a Postgres uuid column, so handing it a malformed value raises a cast error rather
// than matching nothing — which surfaced as a 500 on a public endpoint before this guard.
// Checking the shape first keeps that in the application, where it belongs.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parses an ISO-8601 date from a query parameter.
 *
 * Rejects rather than silently coercing: `new Date('next tuesday')` is Invalid Date, and
 * passing that into a WHERE clause yields an empty result set that looks like "no events"
 * instead of "your filter was malformed".
 */
function parseDateParam(value, name) {
  if (value === undefined) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new error.BadRequest(`'${name}' must be an ISO-8601 date (e.g. 2026-09-10 or 2026-09-10T18:00:00Z)`);
  }
  return parsed;
}

/**
 * Parses a non-negative integer query parameter.
 *
 * Explicitly rejects garbage instead of falling back to the default. The authenticated event
 * routes use parseInt and let NaN flow into the finder, which then quietly substitutes its
 * own default — fine for a first-party caller reading its own code, confusing for an outside
 * consumer who mistyped a parameter and got a plausible-looking page back.
 */
function parseIntParam(value, name, { min = 0, max, fallback } = {}) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(String(value))) {
    throw new error.BadRequest(`'${name}' must be a non-negative integer`);
  }
  const parsed = Number(value);
  if (parsed < min) throw new error.BadRequest(`'${name}' must be at least ${min}`);
  if (max !== undefined && parsed > max) {
    throw new error.BadRequest(`'${name}' must be at most ${max}`);
  }
  return parsed;
}

/**
 * GET /api/v1/public/events
 *
 * Query parameters, all optional:
 *   committee  exact committee name, e.g. 'Hack'
 *   from       ISO-8601 lower bound on startDate, inclusive
 *   to         ISO-8601 upper bound on startDate, inclusive
 *   offset     default 0
 *   limit      default 50, max 100
 *
 * Ordered by startDate ascending. `total` is the count matching the filters, before
 * offset/limit, so a consumer can page without guessing when to stop.
 */
router.route('/').get((req, res, next) => {
  let params;
  try {
    const { committee } = req.query;
    if (committee !== undefined && (typeof committee !== 'string' || committee.length > MAX_COMMITTEE_LENGTH)) {
      throw new error.BadRequest(`'committee' must be a string of at most ${MAX_COMMITTEE_LENGTH} characters`);
    }

    const from = parseDateParam(req.query.from, 'from');
    const to = parseDateParam(req.query.to, 'to');
    if (from && to && from > to) {
      throw new error.BadRequest("'from' must not be later than 'to'");
    }

    params = {
      committee,
      from,
      to,
      offset: parseIntParam(req.query.offset, 'offset', { fallback: 0 }),
      limit: parseIntParam(req.query.limit, 'limit', {
        min: 1, max: MAX_LIMIT, fallback: DEFAULT_LIMIT,
      }),
    };
  } catch (err) {
    return next(err);
  }

  return Event.getPublicEvents(params)
    .then(({ rows, count }) => {
      const events = rows.map((e) => {
        const serialized = e.getPublicApi();
        serialized.cover = normalizeCover(serialized.cover);
        return serialized;
      });

      res.json({
        error: null,
        events,
        total: count,
        offset: params.offset,
        limit: params.limit,
      });
      return null;
    })
    .catch(next);
});

/**
 * GET /api/v1/public/events/:uuid
 *
 * 404s for an unknown, deleted, or malformed id. No distinction between them: all three
 * identify no event, and an outside consumer has no business learning which case it hit — or
 * that a uuid used to exist.
 */
router.route('/:uuid').get((req, res, next) => {
  if (!UUID_PATTERN.test(req.params.uuid)) {
    return next(new error.NotFound('Event not found'));
  }

  return Event.findPublicByUUID(req.params.uuid)
    .then((event) => {
      if (!event) return next(new error.NotFound('Event not found'));

      const serialized = event.getPublicApi();
      serialized.cover = normalizeCover(serialized.cover);

      res.json({ error: null, event: serialized });
      return null;
    })
    .catch(next);
});

module.exports = { router };
