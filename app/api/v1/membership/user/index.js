const express = require('express');
const { matchedData } = require('express-validator');
const error = require('../../../../error');
const { User, Activity } = require('../../../../db');
const { validateCareerProfileUpdate, validateUserProfileUpdate } = require('./validation');

const router = express.Router();

const getUpdateFields = (req) => {
  // matchedData will only extract the fields that were validated.
  const validatedData = matchedData(req).user;
  const updatedInfo = Object.fromEntries(
    // only include fields that are different from current values
    Object.entries(validatedData)
      .filter(([key, value]) => (
        value !== undefined
        && (typeof value === 'object' || value !== req.user[key])
        // Ignore empty strings for specific fields
        && !(['firstName', 'lastName', 'major'].includes(key) && value === '')
      )),
  );
  return updatedInfo;
};

/**
 * Get user profile for current user
 */
router
  .route('/')
  .get((req, res, next) => {
    if (req.user.isPending()) return next(new error.Forbidden());
    return res.json({ error: null, user: req.user.getUserProfile() });
  })
  /**
   * Update user information given a 'user' object with fields to update and updated information
   */
  .patch(...validateUserProfileUpdate, async (req, res, next) => {
    if (!req.body.user) return next(new error.BadRequest());
    if (req.user.isPending()) return next(new error.Forbidden());

    // Only obtains non-career fields
    const updatedInfo = getUpdateFields(req);
    try {
      const user = await req.user.update(updatedInfo);
      res.json({
        error: null,
        user: user.getUserProfile(),
      });
      Activity.accountUpdatedInfo(
        user.uuid,
        `User profile updated: ${Object.keys(updatedInfo).join(', ')}`,
      );
    } catch (updateError) {
      return next(updateError);
    }

    return null;
  });

router
  .route('/career')
  .get((req, res, next) => {
    if (req.user.isPending()) return next(new error.Forbidden());
    return res.json({ error: null, user: req.user.getCareerProfile() });
  })
  .patch(...validateCareerProfileUpdate, async (req, res, next) => {
    if (!req.body.user) return next(new error.BadRequest());
    if (req.user.isPending()) return next(new error.Forbidden());

    // Only obtains career fields
    const updatedInfo = getUpdateFields(req);
    try {
      const user = await req.user.update(updatedInfo);
      res.json({
        error: null,
        user: user.getCareerProfile(),
      });
      Activity.accountUpdatedInfo(
        user.uuid,
        `Career profile updated: ${Object.keys(updatedInfo).join(', ')}`,
      );
    } catch (updateError) {
      return next(updateError);
    }
    return null;
  });

/**
 * Get the user's public activity (account creation, attend events, etc.)
 */
router.get('/activity', (req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());
  return Activity.getPublicStream(req.user.uuid)
    .then((activity) => {
      res.json({
        error: null,
        activity: activity.map((a) => a.getPublic()),
      });
      return null;
    })
    .catch(next);
});

/**
 * For all further requests on this route, the user needs to be at least an admin
 */
router
  .route('/milestone')
  .all((req, next) => {
    if (!req.user.isAdmin()) return next(new error.Forbidden());
    return next();
  })
  .post((req, res, next) => {
    if (
      !req.body.milestone
      || !req.body.milestone.name
      || typeof req.body.milestone.name !== 'string'
    ) return next(new error.BadRequest('Invalid request format'));

    return User.findAll({})
      .then((users) => {
        users.forEach((user) => {
          Activity.createMilestone(
            user.uuid,
            req.body.milestone.name,
            user.points,
          );
          if (req.body.milestone.resetPoints) {
            user.update({ points: 0 });
          }
        });
        return null;
      })
      .then(() => res.json({ error: null }))
      .catch(next);
  });

router
  .route('/admins')
  .all((req, res, next) => {
    if (!req.user.isSuperAdmin()) return next(new error.Forbidden());
    return next();
  })
  .get((req, res) => User.getAdmins().then((admins) => res.json({ error: null, admins })))
  .post((req, res, next) => {
    // add admins
    if (!req.body.email || typeof req.body.email !== 'string') return next(new error.BadRequest('Invalid email'));

    return User.findByEmail(req.body.email)
      .then((user) => {
        if (!user) return next(new error.BadRequest('User not found'));
        if (user.accessType === 'SUPERADMIN') return next(new error.Forbidden());
        user.update({ accessType: 'ADMIN' });
        return null;
      })
      .then(() => res.json({ error: null }))
      .catch(next);
  })
  // cannot only remove self as superadmin
  // can reassign superadmin to a current admin, which will remove self as superadmin
  .delete((req, res, next) => {
    if (!req.body.email || typeof req.body.email !== 'string') return next(new error.BadRequest('Invalid email'));

    return User.findByEmail(req.body.email)
      .then((user) => {
        if (!user) return next(new error.BadRequest('User not found'));
        if (user.accessType === 'SUPERADMIN') return next(new error.Forbidden());
        user.update({ accessType: 'STANDARD' });
        return null;
      })
      .then(() => res.json({ error: null }))
      .catch(next);
  })
  .patch((req, res, next) => {
    if (!req.body.email || typeof req.body.email !== 'string') return next(new error.BadRequest('Invalid email'));

    return User.findByEmail(req.body.email)
      .then((user) => {
        if (!user) return next(new error.BadRequest('User not found'));
        if (user.accessType !== 'ADMIN') return next(new error.Forbidden('Superadmin must be an admin first'));
        req.user.update({ accessType: 'ADMIN' });
        user.update({ accessType: 'SUPERADMIN' });
        return null;
      })
      .then(() => res.json({ error: null }))
      .catch(next);
  });

module.exports = { router };
