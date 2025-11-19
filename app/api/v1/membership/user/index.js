const express = require('express');
const error = require('../../../../error');
const { User, Activity } = require('../../../../db');
const { validatePublicProfileLookup } = require('./validation');

const router = express.Router();

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
  .patch((req, res, next) => {
    if (!req.body.user) return next(new error.BadRequest());

    if (req.user.isPending()) return next(new error.Forbidden());

    // construct new, sanitized object of update information
    const updatedInfo = {};
    // for each field { fistName, lastName, major, year }
    //   check that it is a valid input and it has changed
    if (
      req.body.user.firstName
      && req.body.user.firstName.length > 0
      && req.body.user.firstName !== req.user.firstName
    ) updatedInfo.firstName = req.body.user.firstName;
    if (
      req.body.user.lastName
      && req.body.user.lastName.length > 0
      && req.body.user.lastName !== req.user.lastName
    ) updatedInfo.lastName = req.body.user.lastName;
    if (
      req.body.user.major
      && req.body.user.major.length > 0
      && req.body.user.major !== req.user.major
    ) updatedInfo.major = req.body.user.major;
    if (
      req.body.user.year
      && Number.isNaN(Number.parseInt(req.body.user.year, 10)) === false
      && Number.parseInt(req.body.user.year, 10) > 0
      && Number.parseInt(req.body.user.year, 10) <= 5
      && req.body.user.year !== req.user.year
    ) updatedInfo.year = Number.parseInt(req.body.user.year, 10);

    // CASE:
    // update the user information normally (with the given information,
    // without any password changes)
    return req.user
      .update(updatedInfo)
      .then((user) => {
        // respond with the newly updated user profile
        res.json({
          error: null,
          user: user.getUserProfile(),
        });
        // record that the user changed some account information, and what info was changed
        Activity.accountUpdatedInfo(
          user.uuid,
          Object.keys(updatedInfo).join(', '),
        );
        return null;
      })
      .catch(next);
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

/*
Individual Profile Endpoint (GET /api/v1/user/profile/:uuid):

Create new route GET /api/v1/user/profile/:uuid

Return user's public profile using getPublicProfile() method

Return 404 if user not found

Return minimal profile if isProfilePublic is false

Add rate limiting (prevent scraping): 100 requests per 15 minutes

Require authentication (only ACM members can view profiles)

Add query parameter support: ?fields=skills,careerInterests to return specific fields

Test edge cases (blocked users, pending users, deleted users)

*/

router
  .route('/profile/:uuid')
  .get(...validatePublicProfileLookup, async (req, res, next) => {
    if (req.user.isPending()
      || req.user.isRestricted()
      || req.user.isBlocked()) return next(new error.Forbidden());

    const { uuid } = req.params;
    const user = await User.findByPk(uuid);
    if (!user) return next(new error.NotFound('User not found'));
    if (user.isPending()
      || user.isRestricted()
      || user.isBlocked()) return next(new error.Forbidden());

    let profile = {
      ...user.getBaseProfile(),
      ...(user.getPublicProfile() || {}),
    };

    if (req.query.fields) {
      const fields = req.query.fields.split(',').map((f) => f.trim());
      profile = Object.fromEntries(
        fields.map((field) => [field, profile[field]])
          .filter(([, value]) => value !== undefined),
      );
    }

    return res.json({
      error: null,
      user: profile,
    });
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
