// In-memory data store for when MongoDB is not available
const inMemoryStore = {
  users: new Map(),
  quests: new Map(),
  messages: new Map(),
};

// Check if MongoDB is connected
const isMongoConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

module.exports = { inMemoryStore, isMongoConnected };
