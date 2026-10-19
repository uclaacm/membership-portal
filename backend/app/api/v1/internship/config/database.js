const mongoose = require('mongoose');
const app = require('../../../..');

const log = app.logger;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/membership-portal-internship';

    await mongoose.connect(mongoURI);

    log.info('MongoDB connected successfully');
  } catch (error) {
    log.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  log.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  log.error('MongoDB connection error:', error);
});

module.exports = { connectDB };
