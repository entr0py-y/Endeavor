require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const questRoutes = require('./routes/quests');
const friendRoutes = require('./routes/friends');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sweepx', {})
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.log('⚠ MongoDB not connected - using in-memory storage');
    console.log('  Install MongoDB with: brew install mongodb-community');
  });

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SweepX API is running' });
});

// Socket.IO for real-time chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('user_status', { userId, online: true });
  });

  socket.on('user_offline', (userId) => {
    onlineUsers.delete(userId);
    io.emit('user_status', { userId, online: false });
  });

  socket.on('send_message', (data) => {
    const recipientSocketId = onlineUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_message', data);
    }
  });

  socket.on('typing_start', (data) => {
    const recipientSocketId = onlineUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', { userId: data.senderId, typing: true });
    }
  });

  socket.on('typing_stop', (data) => {
    const recipientSocketId = onlineUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', { userId: data.senderId, typing: false });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user_status', { userId, online: false });
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║         SWEEPX SERVER ONLINE          ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Frontend: http://localhost:3000`);
  console.log(`✓ API: http://localhost:${PORT}`);
  console.log(`✓ Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/sweepx'}`);
  console.log('\n────────────────────────────────────────');
  console.log('Ready to clean the world! 🌍');
  console.log('────────────────────────────────────────\n');
});

module.exports = { app, io };
