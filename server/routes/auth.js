const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable. Please use guest login or try again later.' });
    }

    const { username, password, displayName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'This username is already taken' });
    }

    const user = new User({
      username: username.toLowerCase(),
      password,
      displayName: displayName || username
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Welcome to SweepX!',
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        xp: user.xp,
        level: user.level,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable. Please use guest login or try again later.' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter your username and password' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.json({
      message: `Welcome back, ${user.displayName || user.username}!`,
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        questsPosted: user.questsPosted,
        questsCompleted: user.questsCompleted,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// Guest login
router.post('/guest', async (req, res) => {
  try {
    const guestUsername = `guest_${Date.now()}`;
    const guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
    
    // Try to save to database, but fallback to in-memory if DB not connected
    try {
      const user = new User({
        username: guestUsername,
        password: Math.random().toString(36).slice(-12),
        displayName: 'Guest',
        isGuest: true
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Exploring as guest',
        token,
        user: {
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          xp: user.xp || 0,
          level: user.level || 1,
          isGuest: true
        }
      });
    } catch (dbError) {
      // Fallback: create guest without database
      const token = jwt.sign(
        { userId: guestId, username: guestUsername },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Exploring as guest',
        token,
        user: {
          id: guestId,
          username: guestUsername,
          displayName: 'Guest',
          xp: 0,
          level: 1,
          isGuest: true,
          questsPosted: 0,
          questsCompleted: 0
        }
      });
    }
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Could not create guest session' });
  }
});

// Check auth status
router.get('/status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // If MongoDB is connected, get full user data
    if (require('mongoose').connection.readyState === 1) {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ authenticated: false });
      }
      return res.json({ authenticated: true, user });
    }
    
    // In-memory fallback
    res.json({ 
      authenticated: true, 
      user: {
        id: decoded.userId,
        username: decoded.username,
        xp: 0,
        level: 1
      }
    });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

module.exports = router;
