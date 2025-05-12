const express = require('express');
const router = express.Router();
const { User } = require('../../db');

// POST /api/admin/promote
router.post('/promote', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: `User with email ${email} not found` });
    }

    // Update the user to ADMIN role
    await User.update({ accessType: 'ADMIN' }, { where: { email } });

    return res.json({ success: true, message: `User ${email} promoted to admin.` });
  } catch (err) {
    console.error(`Error promoting user: ${err.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
