const express = require('express');
const error = require('../../../../error');
const { AuditLog, db: Sequelize } = require('../../../../db');
const { AUDIT_ACTION_GROUPS } = require('../../../../audit-actions');

const router = express.Router();

const MAX_PAGE_LIMIT = 200;

// Named ranges offered by the Control Panel's range select, in days. 'all' applies no bound.
const RANGES = {
  '7d': 7,
  '30d': 30,
  quarter: 90,
};

/**
 * Filterable audit log. Admin-only — the permission matrix denies officers audit visibility,
 * since the log necessarily spans every committee.
 *
 * Query: ?search= &action=<group|exact> &range=7d|30d|quarter|all &page= &limit=
 */
router.get('/', async (req, res, next) => {
  if (!req.user.isAdmin()) return next(new error.Forbidden());

  const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
  const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.floor(Number(req.query.limit) || 50)));

  const where = {};

  // `action` accepts either a group name ('role') or one exact action ('role.grant').
  if (req.query.action && req.query.action !== 'all') {
    const group = AUDIT_ACTION_GROUPS[req.query.action];
    where.action = group ? { [Sequelize.Op.in]: group } : req.query.action;
  }

  if (req.query.range && req.query.range !== 'all') {
    const days = RANGES[req.query.range];
    if (!days) return next(new error.BadRequest(`Unknown range: ${req.query.range}`));
    where.createdAt = { [Sequelize.Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
  }

  if (req.query.search) {
    const term = `%${req.query.search}%`;
    where[Sequelize.Op.or] = [
      { actorName: { [Sequelize.Op.iLike]: term } },
      { actorEmail: { [Sequelize.Op.iLike]: term } },
      { target: { [Sequelize.Op.iLike]: term } },
    ];
  }

  try {
    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      offset: (page - 1) * limit,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      error: null,
      entries: rows.map((entry) => entry.getPublic()),
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    });
  } catch (queryError) {
    return next(queryError);
  }
});

module.exports = { router };
