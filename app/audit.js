const logger = require('./logger');

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
    detail: entry.detail ? String(entry.detail).slice(0, 255) : null,
    committee: entry.committee || null,
    ip: clientIp(req),
  }).catch((err) => {
    logger.error(`Failed to write audit entry ${entry.action}: ${err.message}`);
  });
};

module.exports = { recordAudit, clientIp };
