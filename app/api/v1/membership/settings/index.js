const express = require('express');
const error = require('../../../../error');
const { Secret, AuditLog } = require('../../../../db');
const { recordAudit, describeChanges } = require('../../../../audit');
const { getReminderMailConfig, sendReminderTest } = require('../../../../reminder-mail');
const logger = require('../../../../logger');

const router = express.Router();

// Legacy marketing settings are retained for existing API clients. Reminder SMTP
// reads usable credentials from backend environment variables instead.
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
      const previous = readConfig(existing);

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
        detail: [
          describeChanges(previous, meta, ['transport', 'host', 'port', 'username', 'from', 'configured'], {
            numbers: ['port'],
          }),
          token ? 'Credential replaced (redacted)' : '',
        ].filter(Boolean).join('; ') || 'No settings changed',
      });
      return null;
    } catch (updateError) {
      return next(updateError);
    }
  });

/** Environment-backed SMTP configuration for RSVP reminders. */
router.get('/email/reminder', (req, res, next) => {
  if (!req.user.isAdmin()) return next(new error.Forbidden());
  return res.json({ error: null, settings: getReminderMailConfig() });
});

/** Send a real SMTP test message to the signed-in admin. */
router.post('/email/test', async (req, res, next) => {
  if (!req.user.isAdmin()) return next(new error.Forbidden());
  if (!getReminderMailConfig().configured) {
    return res.json({
      error: null,
      sent: false,
      message: 'Reminder SMTP is not configured.',
    });
  }

  try {
    await sendReminderTest(req.user.email);
    return res.json({
      error: null,
      sent: true,
      message: `SMTP accepted a test message for ${req.user.email}.`,
    });
  } catch (sendError) {
    logger.error('Reminder SMTP test failed: %s', sendError.code || sendError.name || 'unknown');
    return res.json({
      error: null,
      sent: false,
      message: 'SMTP did not accept the test message. Check the backend logs and configuration.',
    });
  }
});

module.exports = { router };
