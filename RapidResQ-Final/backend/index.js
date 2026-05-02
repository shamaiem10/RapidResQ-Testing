// api/index.js — Vercel serverless entry (Express + serverless-http)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const serverless = require('serverless-http');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const chatRoutes = require('./routes/chat');
const communityRoutes = require('./routes/community');
const panicRoutes = require('./routes/panic');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB before routes (required on cold starts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/api', (req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
  });
}

app.use('/api', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api', chatRoutes);
app.use('/api', communityRoutes);
app.use('/api/community', communityRoutes);
app.use('/api', panicRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

module.exports = serverless(app);
