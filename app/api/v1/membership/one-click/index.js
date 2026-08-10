const express = require('express');
const error = require('../../../../error');
const { Event, Secret, AuditLog } = require('../../../../db');
const auth = require('../../auth').authenticated;
const { recordAudit } = require('../../../../audit');

const router = express.Router();

router
  .route('/')
  .post((req, res, next) => {
    if (!req.body.password || req.body.password.length < 1) return next(new error.BadRequest('Password must be provided'));

    // password verification
    return Secret.findByName('one-click').then((secret) => secret.verifyPassword(req.body.password).then((verified) => {
      if (!verified) return next(new error.UserError('Invalid password'));

      if (!req.body.event) return next(new error.BadRequest());
      if (
        req.body.event.startDate
          && req.body.event.endDate
          && new Date(req.body.event.startDate) > new Date(req.body.event.endDate)
      ) {
        return next(
          new error.BadRequest('Start date must be before end date'),
        );
      }

      return Event.create(Event.sanitize(req.body.event))
        .then((event) => {
          res.json({ error: null, event: event.getPublic() });
          return null;
        })
        .catch(next);
    }));
  })
  /**
   * Rotate the one-click attendance password.
   *
   * Requires an authenticated admin. Knowing the current password is necessary but not
   * sufficient: the check-in password is shared with the devices running check-in, so anyone
   * who has ever run a check-in station knows it. Without this gate, any of them could rotate
   * the secret and lock out every other station.
   *
   * Rotation is a protected action under the permission matrix, so it is always audited.
   */
  .patch(auth, (req, res, next) => {
    if (!req.user.isAdmin()) return next(new error.Forbidden());

    if (
      !req.body.oldPassword
      || req.body.oldPassword.length < 1
      || !req.body.newPassword
      || req.body.newPassword.length < 1
    ) {
      return next(
        new error.BadRequest('Both old and new passwords must be provided'),
      );
    }

    return Secret.findByName('one-click').then((secret) => secret.verifyPassword(req.body.oldPassword).then((verified) => {
      if (!verified) return next(new error.UserError('Invalid password'));

      return Secret.generateHash(req.body.newPassword)
        .then((hash) => secret.update({ hash }))
        .then(() => {
          res.json({ error: null });
          recordAudit(AuditLog, req, {
            action: 'settings.update',
            target: 'One-click API password',
            detail: 'Rotated',
          });
          return null;
        })
        .catch(next);
    }));
  });

module.exports = { router };
