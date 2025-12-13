const express = require('express');
const Quest = require('../models/Quest');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { inMemoryStore, isMongoConnected } = require('../middleware/dbFallback');
const router = express.Router();

// Get all quests
router.get('/', authMiddleware, async (req, res) => {
  try {
    // If MongoDB is not connected, return empty array
    if (!isMongoConnected()) {
      return res.json([]);
    }

    const { status, lat, lng, radius } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }

    let quests;
    
    if (lat && lng && radius) {
      // Geospatial query
      quests = await Quest.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
          }
        }
      })
      .populate('postedBy', 'username displayName avatar')
      .populate('completedBy', 'username displayName avatar')
      .sort({ createdAt: -1 });
    } else {
      quests = await Quest.find(query)
        .populate('postedBy', 'username displayName avatar')
        .populate('completedBy', 'username displayName avatar')
        .sort({ createdAt: -1 })
        .limit(100);
    }

    res.json({ quests });
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ message: 'Could not load quests' });
  }
});

// Create a quest
router.post('/', authMiddleware, async (req, res) => {
  try {
    // If MongoDB is not connected, return error
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }

    const { title, description, location, address, beforePhoto } = req.body;

    if (!title || !description || !location || !beforePhoto) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const quest = new Quest({
      title,
      description,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      address,
      beforePhoto,
      postedBy: req.userId
    });

    await quest.save();
    await User.findByIdAndUpdate(req.userId, { $inc: { questsPosted: 1, xp: 10 } });

    const populatedQuest = await Quest.findById(quest._id)
      .populate('postedBy', 'username displayName avatar');

    res.status(201).json({
      message: 'Quest posted! Thanks for helping clean up.',
      quest: populatedQuest
    });
  } catch (error) {
    console.error('Create quest error:', error);
    res.status(500).json({ message: 'Could not post quest' });
  }
});

// Get single quest by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    const quest = await Quest.findById(req.params.id)
      .populate('postedBy', 'username displayName avatar')
      .populate('completedBy', 'username displayName avatar');
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    res.json(quest);
  } catch (error) {
    console.error('Get quest error:', error);
    res.status(500).json({ message: 'Could not fetch quest' });
  }
});

// Accept quest
router.post('/:id/accept', authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const quest = await Quest.findById(req.params.id);
    if (!quest) {
      console.log('Quest not found:', req.params.id);
      return res.status(404).json({ message: 'Quest not found' });
    }

    console.log('Quest status:', quest.status, 'Posted by:', quest.postedBy, 'User:', req.userId);

    if (quest.status !== 'open') {
      console.log('Quest not open, current status:', quest.status);
      return res.status(400).json({ message: 'This quest is no longer available. Current status: ' + quest.status });
    }

    if (quest.postedBy.toString() === req.userId) {
      console.log('User trying to accept own quest');
      return res.status(400).json({ message: 'You cannot accept your own quest' });
    }

    quest.status = 'in-progress';
    quest.acceptedBy = req.userId;
    await quest.save();

    const populatedQuest = await Quest.findById(quest._id)
      .populate('postedBy', 'username displayName avatar')
      .populate('acceptedBy', 'username displayName avatar');

    res.json({
      message: 'Quest accepted! Go clean it up and upload the after photo.',
      quest: populatedQuest
    });
  } catch (error) {
    console.error('Accept quest error:', error);
    res.status(500).json({ message: 'Could not accept quest' });
  }
});

// Complete quest
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { afterPhoto } = req.body;

    if (!afterPhoto) {
      return res.status(400).json({ message: 'Please upload an after photo' });
    }

    const quest = await Quest.findById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    if (quest.status === 'completed' || quest.status === 'verified') {
      return res.status(400).json({ message: 'This quest has already been completed' });
    }

    if (quest.postedBy.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot complete your own quest' });
    }

    quest.afterPhoto = afterPhoto;
    quest.status = 'completed';
    quest.completedBy = req.userId;
    quest.completedAt = new Date();

    await quest.save();

    const user = await User.findById(req.userId);
    user.xp += quest.xpReward;
    user.questsCompleted += 1;
    user.updateLevel();
    await user.save();

    const populatedQuest = await Quest.findById(quest._id)
      .populate('postedBy', 'username displayName avatar')
      .populate('completedBy', 'username displayName avatar');

    res.json({
      message: `Amazing work! You earned ${quest.xpReward} XP.`,
      quest: populatedQuest,
      xpEarned: quest.xpReward,
      newXP: user.xp,
      newLevel: user.level
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ message: 'Could not complete quest' });
  }
});

// Delete quest
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    if (quest.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own quests' });
    }

    await Quest.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quest deleted' });
  } catch (error) {
    console.error('Delete quest error:', error);
    res.status(500).json({ message: 'Could not delete quest' });
  }
});

// Get quest categories/statistics
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json({
        total: 0,
        open: 0,
        inProgress: 0,
        completed: 0
      });
    }

    const [total, open, inProgress, completed] = await Promise.all([
      Quest.countDocuments(),
      Quest.countDocuments({ status: 'open' }),
      Quest.countDocuments({ status: 'in_progress' }),
      Quest.countDocuments({ status: 'completed' })
    ]);

    res.json({ total, open, inProgress, completed });
  } catch (error) {
    console.error('Get categories error:', error);
    res.json({ total: 0, open: 0, inProgress: 0, completed: 0 });
  }
});

module.exports = router;
