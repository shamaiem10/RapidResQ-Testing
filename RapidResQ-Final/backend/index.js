// Backend entry for Vercel — Express + serverless-http
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const serverless = require('serverless-http');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

dotenv.config();

/** Only load heavy routers when a matching path is hit (faster /api/signup cold starts). */
function lazyMountedRouter(routeModulePath, subpathMatcher) {
  let cached = null;
  return function lazyMiddleware(req, res, next) {
    const p = req.path || '/';
    if (!subpathMatcher(p)) {
      return next();
    }
    if (!cached) {
      cached = require(routeModulePath);
    }
    return cached(req, res, next);
  };
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vercel can invoke with path /signup — normalize so routes under /api match.
app.use((req, _res, next) => {
  const raw = req.url || '/';
  const pathOnly = raw.split('?')[0];
  const qs = raw.includes('?') ? raw.slice(raw.indexOf('?')) : '';
  if (!pathOnly.startsWith('/api')) {
    req.url = '/api' + (pathOnly === '/' ? '' : pathOnly) + qs;
  }
  next();
});

// No Mongo — use to verify routing / cold start
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'rapidresq-api' });
});

// DB for all data routes (skip OPTIONS so CORS preflight does not wait on Mongo)
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/api', (req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl || req.path}`);
    next();
  });
}

app.use('/api', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api', lazyMountedRouter('./routes/chat', (p) => /^\/chat(\/|$)/.test(p)));
app.use('/api', lazyMountedRouter('./routes/panic', (p) => /^\/panic(\/|$)/.test(p)));
app.use('/api', lazyMountedRouter('./routes/community', (p) => /^\/posts(\/|$)/.test(p)));
app.use('/api/community', lazyMountedRouter('./routes/community', () => true));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, _next) => {
  console.error('Server Error:', err);
  const isMongoTimeout =
    err.name === 'MongoServerSelectionError' ||
    /Server selection timed out/i.test(String(err.message));

  if (isMongoTimeout && !res.headersSent) {
    return res.status(503).json({
      success: false,
      message:
        'Database is unavailable or blocked. Check MongoDB Atlas Network Access (allow 0.0.0.0/0), MONGO_URI on Vercel, and region latency.',
      code: 'mongo_unavailable',
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

module.exports = serverless(app);
