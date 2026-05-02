/**
 * Minimal Express apps for signup/login-only Vercel functions.
 * Keeps deps tiny vs api/index.js (no emergency/chat/community imports).
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const serverless = require('serverless-http');
const connectDB = require('./config/database');
const { signupUser, loginUser } = require('./controllers/authController');

dotenv.config();

function mongoErrorHandler(err, req, res, _next) {
  console.error('[slimAuth]', err);
  const isMongoTimeout =
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkTimeoutError' ||
    err.name === 'MongoTimeoutError' ||
    /Server selection timed out|connection.*timed out|buffering timed out/i.test(
      String(err.message),
    );
  if (isMongoTimeout && !res.headersSent) {
    return res.status(503).json({
      success: false,
      message:
        'Database is unavailable or blocked. Check MongoDB Atlas Network Access (allow 0.0.0.0/0), MONGO_URI on Vercel, and region latency.',
      code: 'mongo_unavailable',
    });
  }
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
  }
}

function buildApp(which) {
  const handler = which === 'login' ? loginUser : signupUser;
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    try {
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  });

  app.post('/', handler);
  app.post(which === 'login' ? '/login' : '/signup', handler);
  app.post(which === 'login' ? '/api/login' : '/api/signup', handler);

  app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
  app.use(mongoErrorHandler);

  return app;
}

function slimSignup() {
  return serverless(buildApp('signup'));
}

function slimLogin() {
  return serverless(buildApp('login'));
}

module.exports = { slimSignup, slimLogin };
