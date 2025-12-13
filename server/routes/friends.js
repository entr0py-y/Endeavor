const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Send friend request
router.post('/request/:username', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend' });
    }

    const currentUser = await User.findById(req.userId);

    // Check if already friends
    if (currentUser.friends.includes(targetUser._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already sent
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === currentUser._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push({ from: currentUser._id });
    await targetUser.save();

    res.json({ message: `Friend request sent to ${targetUser.displayName || targetUser.username}` });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Could not send friend request' });
  }
});

// Accept friend request
router.post('/accept/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const requestingUser = await User.findById(req.params.userId);

    if (!requestingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove friend request
    currentUser.friendRequests = currentUser.friendRequests.filter(
      req => req.from.toString() !== requestingUser._id.toString()
    );

    // Add to friends list
    if (!currentUser.friends.includes(requestingUser._id)) {
      currentUser.friends.push(requestingUser._id);
    }
    if (!requestingUser.friends.includes(currentUser._id)) {
      requestingUser.friends.push(currentUser._id);
    }

    await currentUser.save();
    await requestingUser.save();

    res.json({ message: `You are now friends with ${requestingUser.displayName || requestingUser.username}` });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Could not accept friend request' });
  }
});

// Decline friend request
router.post('/decline/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

    currentUser.friendRequests = currentUser.friendRequests.filter(
      req => req.from.toString() !== req.params.userId
    );

    await currentUser.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ message: 'Could not decline friend request' });
  }
});

// Get friend requests
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friendRequests.from', 'username displayName avatar xp level');

    res.json({ requests: user.friendRequests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Could not load friend requests' });
  }
});

// Get friends list
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'username displayName avatar xp level');

    res.json({ friends: user.friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Could not load friends' });
  }
});

// Remove friend
router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const friendUser = await User.findById(req.params.userId);

    if (!friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    currentUser.friends = currentUser.friends.filter(
      id => id.toString() !== friendUser._id.toString()
    );
    friendUser.friends = friendUser.friends.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await friendUser.save();

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Could not remove friend' });
  }
});

module.exports = router;
