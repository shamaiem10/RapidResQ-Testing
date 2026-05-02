// MongoDB connection (Atlas) — serverless-friendly cache for Vercel

const mongoose = require('mongoose');

// Avoid queuing operations while disconnected (can extend serverless time)
mongoose.set('bufferCommands', false);

let cached = global.__rapidresqMongoose;
if (!cached) {
  cached = global.__rapidresqMongoose = { promise: null, listenerAttached: false };
}

if (!cached.listenerAttached) {
  mongoose.connection.on('disconnected', () => {
    cached.promise = null;
  });
  cached.listenerAttached = true;
}

function raceWithTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      const err = new Error(`${label} (${ms}ms)`);
      err.name = 'MongoNetworkTimeoutError';
      reject(err);
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/**
 * Reuse connect promise across Lambda invocations; drop cache if socket dies.
 */
async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (
    typeof mongoURI !== 'string' ||
    !mongoURI.trim()
  ) {
    throw new Error(
      'MONGO_URI is not set. Add it to your environment (e.g. .env locally, Vercel Project Settings).',
    );
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const isVercel = process.env.VERCEL === '1';
  /** Hard ceiling so a stuck SRV/DNS/TCP path cannot burn until Vercel maxDuration (e.g. 60s). */
  const connectBudgetMS = Number(
    process.env.MONGODB_CONNECT_BUDGET_MS || (isVercel ? 14000 : 45000),
  );

  try {
    if (!cached.promise) {
      const serverSelectionTimeoutMS = Number(
        process.env.MONGODB_SERVER_SELECTION_MS || (isVercel ? 8000 : 5000),
      );
      const connectTimeoutMS = Number(
        process.env.MONGODB_CONNECT_TIMEOUT_MS || (isVercel ? 8000 : 7500),
      );

      const opts = {
        serverSelectionTimeoutMS,
        connectTimeoutMS,
        // Was 45s default — combined with retries that could sit near Vercel's 60s wall and die as 504.
        socketTimeoutMS: Number(
          process.env.MONGODB_SOCKET_TIMEOUT_MS || (isVercel ? 12000 : 45000),
        ),
        waitQueueTimeoutMS: Number(
          process.env.MONGODB_WAIT_QUEUE_MS || (isVercel ? 10000 : 20000),
        ),
        maxPoolSize: Number(
          process.env.MONGODB_MAX_POOL_SIZE || (isVercel ? 2 : 6),
        ),
        minPoolSize: 0,
        maxIdleTimeMS: 55000,
        maxConnecting: 2,
      };
      /** Opt-in IPv4 pinning only if Atlas requires it; default lets Node/Vercel pick (often fixes flaky SRV). */
      if (process.env.MONGODB_FORCE_IPV4 === '1') {
        opts.family = 4;
      }

      cached.promise = mongoose.connect(mongoURI.trim(), opts);
    }
    await raceWithTimeout(
      cached.promise,
      connectBudgetMS,
      'Mongo connect exceeded wall-clock budget',
    );
    return mongoose;
  } catch (err) {
    cached.promise = null;
    try {
      await mongoose.disconnect();
    } catch {
      /* ignore */
    }
    throw err;
  }
}

module.exports = connectDB;
