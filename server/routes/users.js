const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { inMemoryStore, isMongoConnected } = require('../middleware/dbFallback');
const router = express.Router();

// Get user profile
router.get('/profile/:username', authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('friends', 'username displayName avatar xp level');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Could not load profile' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, bio, avatar, preferences } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences !== undefined) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Could not update profile' });
  }
});

// Get leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ isGuest: false })
      .select('username displayName avatar xp level questsCompleted')
      .sort({ xp: -1 })
      .limit(100);

    res.json({ users });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Could not load leaderboard' });
  }
});

// Search users
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      isGuest: false
    })
    .select('username displayName avatar xp level')
    .limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

module.exports = router;
