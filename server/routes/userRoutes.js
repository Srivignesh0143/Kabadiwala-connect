const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

function sanitizeUser(user) {
  if (!user) return user;
  const { password, ...safeUser } = user.toObject ? user.toObject() : user;
  return safeUser;
}

router.get('/', protect(['ADMIN']), async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ users: users.map(sanitizeUser) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load users', error: error.message });
  }
});

router.get('/:id', protect(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load user', error: error.message });
  }
});

router.patch('/:id/verify', protect(['ADMIN']), async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.verificationStatus = ['PENDING', 'VERIFIED', 'REJECTED'].includes(verificationStatus) ? verificationStatus : 'VERIFIED';
    await user.save();
    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update user status', error: error.message });
  }
});

module.exports = router;
