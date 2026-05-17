const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../../db');
const { authenticated } = require('./auth');

const hardcodedPassword = '$2b$10$t5itVIAG3WQTZsIKq2Fs9e8qbSAJAB7WgIXjTnE75HOEV13TzF6bK';

// POST /api/admin/promote
router.post('/promote', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const isPasswordValid = await bcrypt.compare(password, hardcodedPassword);

  if (!isPasswordValid) {
    return res.status(403).json({ error: 'Incorrect promotion password' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: `User with email ${email} not found` });
    }

    // Update the user to ADMIN role
    await User.update({ accessType: 'ADMIN' }, { where: { email } });

    return res.json({ success: true, message: `User ${email} promoted to admin. Sign out to see the change.` });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/promote-officer
// Promotes an existing user to OFFICER with optional committee assignments.
// Requires admin JWT auth.
router.post('/promote-officer', authenticated, async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin()) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, committees } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: `No user found with email ${email}` });

    await user.update({ accessType: 'OFFICER', committees: committees || [] });

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
