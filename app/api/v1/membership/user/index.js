const express = require('express');
const { matchedData } = require('express-validator');
const error = require('../../../../error');
const {
  User, Activity, AuditLog, db: Sequelize,
} = require('../../../../db');
const { recordAudit } = require('../../../../audit');
const { COMMITTEES } = require('../../../../committees');
const {
  validatePublicProfileLookup,
  validateDirectoryLookup,
  validateUserProfileUpdate,
  validateCareerProfileUpdate,
} = require('./validation');

const router = express.Router();
const MAX_PAGE_LIMIT = 100;

// Upper bound on one bulk role/committee call. Each target is a separate lookup and update,
// so an unbounded paste would hold a request open indefinitely.
const MAX_BULK_TARGETS = 200;

const getUpdateFields = (req) => {
  // matchedData will only extract the fields that were validated.
  const validatedData = matchedData(req).user;

  // Optional URL fields that can be cleared with empty strings
  const optionalUrlFields = ['portfolioUrl', 'personalWebsite', 'resumeUrl'];

  const updatedInfo = Object.fromEntries(
    // only include fields that are different from current values
    Object.entries(validatedData)
      .filter(([key, value]) => {
        // Always filter out undefined values
        if (value === undefined) return false;

        // Ignore empty strings for required fields
        if (['firstName', 'lastName', 'major'].includes(key) && value === '') return false;

        // Allow empty strings for optional URL fields (to clear them)
        if (optionalUrlFields.includes(key) && value === '') return true;

        // Include if value is object or different from current value
        return typeof value === 'object' || value !== req.user[key];
      }),
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

router
  .route('/profile/:uuid')
  .get(...validatePublicProfileLookup, async (req, res, next) => {
    if (req.user.isPending()
      || req.user.isRestricted()
      || req.user.isBlocked()) return next(new error.Forbidden());

    const { uuid } = req.params;
    const user = await User.findByUUID(uuid);
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
      profile,
    });
  });

router.get('/directory', ...validateDirectoryLookup, async (req, res, next) => {
  if (req.user.isPending()) return next(new error.Forbidden());

  const page = Math.floor(Number(req.query.page) || 1);
  const limit = Math.min(MAX_PAGE_LIMIT, Math.floor(Number(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const where = {
    isProfilePublic: true,
    state: 'ACTIVE',
  };

  // Filter by skills.
  // No explicit cast: `skills` is varchar[], so casting the bound array to text[] leaves
  // Postgres with `varchar[] && text[]`, for which no operator exists — every filtered
  // request 500ed. Passing the plain array lets Sequelize render it against the column type.
  if (req.query.skills) {
    const skills = req.query.skills.split(',').map((s) => s.trim());
    where.skills = { [Sequelize.Op.overlap]: skills };
  }

  // Filter by career interests (varchar[] as well — same reasoning as skills above)
  if (req.query.careerInterests) {
    const interests = req.query.careerInterests.split(',').map((i) => i.trim());
    where.careerInterests = { [Sequelize.Op.overlap]: interests };
  }

  // Search by name
  if (req.query.search) {
    where[Sequelize.Op.or] = [
      { firstName: { [Sequelize.Op.iLike]: `%${req.query.search}%` } },
      { lastName: { [Sequelize.Op.iLike]: `%${req.query.search}%` } },
    ];
  }

  try {
    const { rows, count } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['points', 'DESC']],
    });
    res.json({
      error: null,
      directory: {
        users: rows.map((user) => ({
          ...user.getBaseProfile(),
          ...user.getPublicProfile(),
        })),
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (queryError) {
    next(queryError);
  }
  return null;
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

/**
 * Paginated roster backing the Control Panel's Users table.
 *
 * Both admins and officers see every member — an officer needs the full chapter roster to do
 * anything useful. What differs is the sensitive columns: the permission matrix grants
 * "view members of own committee" but denies "view member emails portal-wide", so an officer
 * sees contact and role-grant details only for members of their own committees. Everyone
 * else's are redacted server-side rather than hidden in the UI, so the data never leaves the
 * API in the first place.
 */
router.get('/roster', async (req, res, next) => {
  const isAdmin = req.user.isAdmin();
  const isOfficer = req.user.isOfficer();
  if (!isAdmin && !isOfficer) return next(new error.Forbidden());

  const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
  const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.floor(Number(req.query.limit) || 25)));

  const ownCommittees = req.user.committees || [];
  const canSeeSensitive = (user) => isAdmin
    || (user.committees || []).some((c) => ownCommittees.includes(c));

  try {
    const { rows, count } = await User.getRoster({
      search: req.query.search,
      searchEmail: isAdmin,
      role: req.query.role,
      committee: req.query.committee,
      offset: (page - 1) * limit,
      limit,
    });

    return res.json({
      error: null,
      users: rows.map((user) => user.getRosterProfile({ sensitive: canSeeSensitive(user) })),
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    });
  } catch (queryError) {
    return next(queryError);
  }
});

/**
 * Officer roster with committees and position. Admin-only: the officer list is a role map, and
 * the matrix denies officers any visibility into role assignment.
 */
router.get('/officers', async (req, res, next) => {
  if (!req.user.isAdmin()) return next(new error.Forbidden());
  try {
    const officers = await User.getOfficers();
    return res.json({ error: null, officers: officers.map((o) => o.getRosterProfile()) });
  } catch (queryError) {
    return next(queryError);
  }
});

/**
 * Grant or revoke an elevated role, with committee scope.
 *
 * Replaces the email-keyed addAdmin/removeAdmin/promote-officer trio with one uuid-keyed route.
 * Every call is audited, because every role change is a protected action under the matrix.
 *
 * Body: { role: 'Member'|'Officer'|'Admin', committees?: string[], position?: string }
 */
/**
 * Bulk role and committee assignment.
 *
 * Accepts uuids (the Users table's selection) or emails (a pasted list), so both the
 * "assign committee" bulk action and the "add users by email" flow use one endpoint.
 *
 * Partial success is the normal case: a pasted list routinely contains an address that never
 * registered. Every identifier is reported as either updated or failed-with-a-reason rather
 * than failing the whole request on the first bad one.
 *
 * Body: {
 *   uuids?: string[], emails?: string[],
 *   role?: 'Member'|'Officer'|'Admin',
 *   committees?: string[],
 *   committeeMode?: 'add'|'remove'|'replace'   // default 'add'
 * }
 */
router.patch('/bulk', async (req, res, next) => {
  if (!req.user.isAdmin()) return next(new error.Forbidden());

  const {
    uuids = [], emails = [], role, committees, committeeMode = 'add',
  } = req.body || {};

  if (!Array.isArray(uuids) || !Array.isArray(emails)) {
    return next(new error.BadRequest('uuids and emails must be arrays'));
  }
  if (uuids.length === 0 && emails.length === 0) {
    return next(new error.BadRequest('Provide at least one uuid or email.'));
  }
  if (uuids.length + emails.length > MAX_BULK_TARGETS) {
    return next(new error.BadRequest(`At most ${MAX_BULK_TARGETS} users can be updated at once.`));
  }

  const ROLE_TO_ACCESS = { Member: 'STANDARD', Officer: 'OFFICER', Admin: 'ADMIN' };
  if (role !== undefined && !ROLE_TO_ACCESS[role]) {
    return next(new error.BadRequest("role must be one of 'Member', 'Officer', 'Admin'"));
  }
  if (!['add', 'remove', 'replace'].includes(committeeMode)) {
    return next(new error.BadRequest("committeeMode must be 'add', 'remove' or 'replace'"));
  }
  if (committees !== undefined) {
    if (!Array.isArray(committees)) return next(new error.BadRequest('committees must be an array'));
    const invalid = committees.filter((c) => !COMMITTEES.includes(c));
    if (invalid.length > 0) {
      return next(new error.BadRequest(`Invalid committee(s): ${invalid.join(', ')}`));
    }
  }
  if (role === undefined && committees === undefined) {
    return next(new error.BadRequest('Provide a role, committees, or both.'));
  }

  const updated = [];
  const failed = [];

  const applyTo = async (target, identifier) => {
    if (!target) {
      failed.push({ identifier, reason: 'No account found with that email.' });
      return;
    }
    if (target.uuid === req.user.uuid) {
      failed.push({ identifier, reason: 'You cannot change your own role.' });
      return;
    }
    if (target.isSuperAdmin() && !req.user.isSuperAdmin()) {
      failed.push({ identifier, reason: 'Only a super admin can change a super admin.' });
      return;
    }

    const current = target.committees || [];
    let nextCommittees = current;
    if (committees !== undefined) {
      if (committeeMode === 'replace') nextCommittees = [...new Set(committees)];
      else if (committeeMode === 'remove') nextCommittees = current.filter((c) => !committees.includes(c));
      else nextCommittees = [...new Set([...current, ...committees])];
    }

    const nextRole = role ?? (target.isAdmin() ? 'Admin' : (target.isOfficer() ? 'Officer' : 'Member'));

    if (nextRole === 'Member') {
      // `committees` is officer/admin scope; a standard member has none. Only object when the
      // caller explicitly asked to assign some — carrying committees over from the previous
      // role during a demotion is not a contradiction, it just clears them.
      const explicitlyAssigning = committees !== undefined
        && committeeMode !== 'remove'
        && committees.length > 0;

      if (explicitlyAssigning) {
        failed.push({
          identifier,
          reason: 'Committees apply to officers and admins. Set a role as well.',
        });
        return;
      }
      nextCommittees = [];
    }

    // Same invariant as the single-user route: officer scope cannot be empty.
    if (nextRole === 'Officer' && nextCommittees.length === 0) {
      failed.push({
        identifier,
        reason: 'An officer must belong to at least one committee.',
      });
      return;
    }

    try {
      await target.update({
        accessType: ROLE_TO_ACCESS[nextRole],
        committees: nextCommittees,
        roleGrantedBy: nextRole === 'Member' ? null : req.user.email,
        roleGrantedAt: nextRole === 'Member' ? null : new Date(),
      });
    } catch (updateError) {
      // A validation failure on one user must not abort the rest of the batch.
      failed.push({ identifier, reason: updateError.message });
      return;
    }

    updated.push({
      uuid: target.uuid,
      email: target.email,
      role: nextRole,
      committees: nextCommittees,
    });

    const scope = nextCommittees.length > 0 ? ` · ${nextCommittees.join(', ')}` : '';
    recordAudit(AuditLog, req, {
      action: nextRole === 'Member' ? 'role.revoke' : 'role.grant',
      target: target.email,
      detail: `Bulk: ${nextRole.toLowerCase()}${scope}`,
      committee: nextCommittees[0] || null,
    });
  };

  try {
    // Sequential so the audit entries land in a predictable order and a large paste cannot
    // open one connection per address.
    for (let i = 0; i < uuids.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await applyTo(await User.findByUUID(uuids[i]), uuids[i]);
    }
    for (let i = 0; i < emails.length; i += 1) {
      const email = String(emails[i]).trim().toLowerCase();
      if (!email) continue; // eslint-disable-line no-continue
      // Compared case-insensitively via lower() rather than iLike: an underscore is legal in
      // an email address but is a single-character wildcard to LIKE, which could match the
      // wrong account.
      // eslint-disable-next-line no-await-in-loop
      await applyTo(
        await User.findOne({
          where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), email),
        }),
        emails[i],
      );
    }

    return res.json({ error: null, updated, failed });
  } catch (bulkError) {
    return next(bulkError);
  }
});

router.patch('/:uuid/role', async (req, res, next) => {
  if (!req.user.isAdmin()) return next(new error.Forbidden());

  const { role, committees, position } = req.body || {};
  const ROLE_TO_ACCESS = { Member: 'STANDARD', Officer: 'OFFICER', Admin: 'ADMIN' };
  if (!ROLE_TO_ACCESS[role]) {
    return next(new error.BadRequest("role must be one of 'Member', 'Officer', 'Admin'"));
  }

  if (committees !== undefined) {
    if (!Array.isArray(committees)) return next(new error.BadRequest('committees must be an array'));
    const invalid = committees.filter((c) => !COMMITTEES.includes(c));
    if (invalid.length > 0) {
      return next(new error.BadRequest(`Invalid committee(s): ${invalid.join(', ')}`));
    }
  }

  try {
    const target = await User.findByUUID(req.params.uuid);
    if (!target) return next(new error.NotFound('User not found'));

    // Only a super admin may alter a super admin, and nobody may demote themselves out of
    // the role they are currently using to make the request.
    if (target.isSuperAdmin() && !req.user.isSuperAdmin()) {
      return next(new error.Forbidden('Only a super admin can change a super admin.'));
    }
    if (target.uuid === req.user.uuid) {
      return next(new error.Forbidden('You cannot change your own role.'));
    }

    const previousRole = target.isAdmin() ? 'Admin' : (target.isOfficer() ? 'Officer' : 'Member');
    const accessType = ROLE_TO_ACCESS[role];
    const nextCommittees = role === 'Member' ? [] : (committees ?? target.committees ?? []);

    // The officer role *is* committee scope — every permission it grants is "within your own
    // committee". Without one, an officer can act on nothing yet still reads the member
    // roster and uploads media, which is a half-privileged account nobody intended.
    if (role === 'Officer' && nextCommittees.length === 0) {
      return next(new error.BadRequest('An officer must belong to at least one committee.'));
    }

    await target.update({
      accessType,
      committees: nextCommittees,
      position: role === 'Member' ? null : (position || target.position),
      roleGrantedBy: role === 'Member' ? null : req.user.email,
      roleGrantedAt: role === 'Member' ? null : new Date(),
    });

    const scope = nextCommittees.length > 0 ? ` · ${nextCommittees.join(', ')}` : '';
    recordAudit(AuditLog, req, {
      action: role === 'Member' ? 'role.revoke' : 'role.grant',
      target: target.email,
      detail: role === 'Member'
        ? `Removed ${previousRole.toLowerCase()}${scope}`
        : `Granted ${role.toLowerCase()}${scope}`,
      committee: nextCommittees[0] || null,
    });

    return res.json({ error: null, user: target.getRosterProfile() });
  } catch (updateError) {
    return next(updateError);
  }
});

router
  .route('/admins')
  /**
   * Reading the admin list is allowed for any admin — knowing who else holds elevated access
   * is part of doing the job, and the permission matrix scopes admins portal-wide rather than
   * by committee. Only the mutating verbs below stay super-admin-only.
   */
  .get((req, res, next) => {
    if (!req.user.isAdmin()) return next(new error.Forbidden());
    return User.getAdmins()
      // getRosterProfile keeps this to display fields; the raw model was being serialized whole.
      .then((admins) => res.json({ error: null, admins: admins.map((a) => a.getRosterProfile()) }))
      .catch(next);
  })
  /**
   * Granting and revoking admin through *this* route stays super-admin-only. The audited,
   * uuid-keyed PATCH /user/:uuid/role is the supported path for an ordinary admin, and it is
   * what the Control Panel uses.
   */
  .all((req, res, next) => {
    if (!req.user.isSuperAdmin()) return next(new error.Forbidden());
    return next();
  })
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
