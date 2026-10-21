const logger = require('./logger');

const FIELD_LABELS = {
  attendancePoints: 'Points',
  accessType: 'Role',
  startDate: 'Starts',
  endDate: 'Ends',
  eventLink: 'Event link',
  cover: 'Cover image',
  thumb: 'Thumbnail',
  attendanceCode: 'Attendance code',
};
const ROLE_LABELS = { STANDARD: 'Member', OFFICER: 'Officer', ADMIN: 'Admin' };

// Compare allow-listed fields only. Normalize database/form representations without
// conflating null, empty strings, and zero. Secret fields are compared but never printed.
const describeChanges = (before, after, fields, {
  numbers = [], dates = [], sets = [], redacted = [], snapshot = null,
} = {}) => {
  const normalize = (field, value) => {
    if (value === undefined || value === null) return null;
    if (numbers.includes(field) && value !== '' && Number.isFinite(Number(value))) {
      return Number(value);
    }
    if (dates.includes(field)) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.toISOString();
    }
    if (sets.includes(field) && Array.isArray(value)) return [...new Set(value)].sort();
    return value;
  };
  const format = (field, value) => {
    if (value === null) return 'Not set';
    if (field === 'accessType' && Object.prototype.hasOwnProperty.call(ROLE_LABELS, value)) {
      return ROLE_LABELS[value];
    }
    if (dates.includes(field) && typeof value === 'string'
      && /^\d{4}-\d\d-\d\dT.*Z$/.test(value)) {
      return value.replace('T', ' ').replace('Z', ' UTC');
    }
    if (Array.isArray(value)) return `[${value.map((item) => JSON.stringify(item)).join(', ')}]`;
    return JSON.stringify(value);
  };
  return fields.flatMap((field) => {
    const oldValue = normalize(field, before[field]);
    const newValue = normalize(field, after[field]);
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return [];
    const label = FIELD_LABELS[field] || `${field[0].toUpperCase()}${field.slice(1)}`;
    if (redacted.includes(field)) {
      return [`${label}: ${snapshot ? 'redacted' : 'changed (redacted)'}`];
    }
    if (snapshot) return [`${label}: ${format(field, snapshot === 'before' ? oldValue : newValue)}`];
    return [`${label}: ${format(field, oldValue)} → ${format(field, newValue)}`];
  }).join(' · ');
};

const EVENT_AUDIT_FIELDS = [
  'attendancePoints', 'title', 'committee', 'startDate', 'endDate', 'location',
  'capacity', 'description', 'eventLink', 'cover', 'thumb', 'attendanceCode',
];

const describeEventChanges = (before, after, fields = EVENT_AUDIT_FIELDS, snapshot = null) => (
  describeChanges(
    before,
    after,
    EVENT_AUDIT_FIELDS.filter((field) => fields.includes(field)),
    {
      numbers: ['attendancePoints', 'capacity'],
      dates: ['startDate', 'endDate'],
      redacted: ['attendanceCode'],
      snapshot,
    },
  )
);

/**
 * Extracts the client IP, preferring the left-most entry of X-Forwarded-For because the app runs
 * behind nginx. Express only populates `req.ip` correctly when `trust proxy` is set, so this does
 * not rely on it.
 */
const clientIp = (req) => {
  const forwarded = req.get && req.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (req.ip || (req.connection && req.connection.remoteAddress) || '').replace(/^::ffff:/, '');
};

/**
 * Appends an entry to the audit log.
 *
 * Deliberately fire-and-forget: an audit write must never fail the request that triggered it, or
 * a full disk would make the portal unusable rather than merely unobservable. Failures are logged
 * at error level so they surface in monitoring.
 *
 * @param {object} req   the express request, used for the actor and IP
 * @param {object} entry {action, target, detail, committee}
 * @returns {Promise} resolves once the write settles; callers may ignore it
 */
const recordAudit = (AuditLog, req, entry) => {
  const actor = req.user;
  return AuditLog.create({
    actor: actor ? actor.uuid : null,
    actorName: actor ? `${actor.firstName} ${actor.lastName}` : null,
    actorEmail: actor ? actor.email : null,
    action: entry.action,
    target: entry.target ? String(entry.target).slice(0, 255) : null,
    detail: entry.detail ? String(entry.detail) : null,
    committee: entry.committee || null,
    ip: clientIp(req),
  }).catch((err) => {
    logger.error(`Failed to write audit entry ${entry.action}: ${err.message}`);
  });
};

module.exports = {
  recordAudit, clientIp, describeChanges, describeEventChanges,
};
