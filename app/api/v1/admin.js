const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../../db');

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

module.exports = { router };
