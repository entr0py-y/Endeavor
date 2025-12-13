const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get conversation with a user
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.userId }
      ]
    })
    .populate('sender', 'username displayName avatar')
    .populate('recipient', 'username displayName avatar')
    .sort({ createdAt: 1 })
    .limit(100);

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, recipient: req.userId, read: false },
      { read: true }
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Could not load messages' });
  }
});

// Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const message = new Message({
      sender: req.userId,
      recipient: recipientId,
      content: content.trim()
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username displayName avatar')
      .populate('recipient', 'username displayName avatar');

    // Emit socket event
    const io = req.app.get('io');
    io.emit('new_message', populatedMessage);

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Could not send message' });
  }
});

// Get unread count
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.userId,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Could not get unread count' });
  }
});

// Get conversations list
router.get('/conversations/list', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.userId },
            { recipient: req.userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    const conversationIds = messages.map(m => m._id);
    const users = await User.find({ _id: { $in: conversationIds } })
      .select('username displayName avatar');

    const conversations = messages.map(m => {
      const user = users.find(u => u._id.toString() === m._id.toString());
      return {
        user,
        lastMessage: m.lastMessage
      };
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Could not load conversations' });
  }
});

module.exports = router;
