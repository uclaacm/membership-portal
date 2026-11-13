const express = require('express');

const router = express.Router();
const { User } = require('../../db');
const { authenticated } = require('./auth');

// POST /api/admin/promote-officer
// Promotes an existing user to OFFICER with committee assignments.
// Requires admin JWT auth.
router.post('/promote-officer', authenticated, async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin()) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, committees } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    // The officer role is committee scope — every permission it grants is "within your own
    // committee". A committee-less officer can act on nothing yet still reads the member
    // roster and uploads media, so the assignment is required rather than optional.
    if (!Array.isArray(committees) || committees.length === 0) {
      return res.status(400).json({ error: 'An officer must belong to at least one committee.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: `No user found with email ${email}` });

    await user.update({ accessType: 'OFFICER', committees });

    return res.json({ error: null, message: `${email} promoted to officer.` });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/admin/promote-officer
// Removes an OFFICER from their single committee assignment and demotes them to STANDARD.
// Requires admin JWT auth.
router.delete('/promote-officer', authenticated, async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin()) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, committees } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!Array.isArray(committees) || committees.length !== 1) {
      return res.status(400).json({ error: 'committees must contain exactly one committee to remove.' });
    }

    const [committee] = committees;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: `No user found with email ${email}` });

    if (!user.isOfficer()) {
      return res.status(404).json({ error: `${email} is not an officer.` });
    }

    const current = user.getDataValue('committees') || [];
    if (!current.includes(committee)) {
      return res.status(404).json({
        error: `${email} is not assigned to committee: ${committee}.`,
      });
    }

    await user.update({ accessType: 'STANDARD', committees: [] });
    return res.json({
      error: null,
      message: `${email} removed from ${committee}. Demoted to standard member.`,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = { router };
