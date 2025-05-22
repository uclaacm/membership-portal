const express = require('express');
const router = express.Router();
const { User } = require('../../../db');
const bcrypt = require('bcrypt');
const error = require('../../../error');

const hardcodedPassword = '$2b$10$t5itVIAG3WQTZsIKq2Fs9e8qbSAJAB7WgIXjTnE75HOEV13TzF6bK';


// POST /api/admin/promote
router.post('/promote', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    return next(new error.BadRequest('Email is required'));
  }

  if (!password || typeof password !== 'string') {
    return next(new error.BadRequest('Password is required'));
  }

  try {
    const isPasswordValid = await bcrypt.compare(password, hardcodedPassword);
    if (!isPasswordValid) {
      return next(new error.Forbidden('Incorrect promotion password'));
    }

    const user = await User.findOne({ where: { email } });

    if (!user) return next(new error.BadRequest('User not found'));
    if (user.accessType === 'ADMIN' || user.accessType === 'SUPERADMIN') {
      return res.json({ message: 'User is already an admin.' });
    }

    // ✅ Instance method: ensures Sequelize hooks, enum type safety, and proper DB update
    await user.update({ accessType: 'ADMIN' });

    return res.json({
      success: true,
      message: `User ${email} promoted to admin. Sign out to see the change.`,
    });
  } catch (err) {
    console.error(`Error promoting user: ${err.message}`);
    return next(new error.InternalServerError());
  }
});

module.exports = { router };