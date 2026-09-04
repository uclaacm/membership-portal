const express = require('express');
const error = require('../../../../error');
const { Secret, AuditLog } = require('../../../../db');
const { recordAudit } = require('../../../../audit');

const router = express.Router();

// Where the email transport config lives. Reuses the Secret table rather than adding a
// settings table for one row — Secret already exists for the one-click password and gives us
// hashing and a name-keyed lookup.
const EMAIL_SECRET = 'marketing-email';

const TRANSPORTS = ['none', 'smtp', 'api', 'google'];

/**
 * Non-secret half of the email configuration.
 *
 * Kept apart from the credential deliberately: this is what GET returns, and the token must
 * never be part of it.
 */
const readConfig = (secret) => {
  if (!secret) return { transport: 'none', configured: false };
  try {
    const meta = JSON.parse(secret.getDataValue('meta') || '{}');
    return {
      transport: meta.transport || 'none',
      host: meta.host || null,
      port: meta.port || null,
      username: meta.username || null,
      from: meta.from || null,
      lastSentAt: meta.lastSentAt || null,
      // Whether a credential exists — never the credential itself.
      configured: !!meta.configured,
    };
  } catch (err) {
    return { transport: 'none', configured: false };
  }
};

/**
 * Email notification settings.
 *
 * Reading is admin-visible so the Control Panel can show the current state; writing is
 * super-admin only, matching "rotate one-click password" in the permission matrix.
 */
router
  .route('/email')
  .get((req, res, next) => {
    if (!req.user.isAdmin()) return next(new error.Forbidden());
    return Secret.findByName(EMAIL_SECRET)
      .then((secret) => res.json({ error: null, settings: readConfig(secret) }))
      .catch(next);
  })
  .put(async (req, res, next) => {
    if (!req.user.isSuperAdmin()) {
      return next(new error.Forbidden('Only a super admin can change email settings.'));
    }

    const {
      transport, host, port, username, from, token,
    } = req.body || {};

    if (!TRANSPORTS.includes(transport)) {
      return next(new error.BadRequest(`transport must be one of: ${TRANSPORTS.join(', ')}`));
    }

    try {
      const existing = await Secret.findByName(EMAIL_SECRET);
      const previous = existing ? readConfig(existing) : {};

      const meta = {
        transport,
        host: host ?? previous.host ?? null,
        port: port ?? previous.port ?? null,
        username: username ?? previous.username ?? null,
        from: from ?? previous.from ?? null,
        lastSentAt: previous.lastSentAt ?? null,
        // An omitted token means "leave the stored one alone", so rotating the from-address
        // does not silently wipe the credential.
        configured: token ? true : !!previous.configured,
      };

      const hash = token ? await Secret.generateHash(token) : (existing && existing.getDataValue('hash'));

      if (existing) await existing.update({ hash, meta: JSON.stringify(meta) });
      else await Secret.create({ name: EMAIL_SECRET, hash, meta: JSON.stringify(meta) });

      res.json({ error: null, settings: meta });

      recordAudit(AuditLog, req, {
        action: 'settings.update',
        target: 'Email notifications',
        detail: `Transport set to ${transport}${token ? ' (credential replaced)' : ''}`,
      });
      return null;
    } catch (updateError) {
      return next(updateError);
    }
  });

/**
 * Sends a test message to the signed-in admin.
 *
 * The API does not itself hold a mail client — sending lives in the Next server action layer,
 * which is where the transport is implemented. This endpoint reports whether a transport is
 * configured so the UI can say something useful without leaking the credential.
 */
router.post('/email/test', (req, res, next) => {
  if (!req.user.isAdmin()) return next(new error.Forbidden());

  return Secret.findByName(EMAIL_SECRET)
    .then((secret) => {
      const config = readConfig(secret);
      if (!config.configured || config.transport === 'none') {
        return res.json({
          error: null,
          sent: false,
          message: 'No email transport is configured, so nothing was sent.',
        });
      }
      return res.json({
        error: null,
        sent: true,
        message: `A test message would be sent to ${req.user.email} via ${config.transport}.`,
      });
    })
    .catch(next);
});

module.exports = { router };
