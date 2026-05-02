// MongoDB connection (Atlas) — serverless-friendly cache for Vercel

const mongoose = require('mongoose');

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

/**
 * Reuse connect promise across Lambda invocations; drop cache if socket dies.
 */
async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error(
      'MONGO_URI is not set. Add it to your environment (e.g. .env locally, Vercel Project Settings).',
    );
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    if (!cached.promise) {
      const serverSelectionTimeoutMS = Number(
        process.env.MONGODB_SERVER_SELECTION_MS || 8000,
      );
      const connectTimeoutMS = Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 9000);

      cached.promise = mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS,
        connectTimeoutMS,
        socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000),
        maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 8),
        minPoolSize: 0,
        maxIdleTimeMS: 55000,
      });
    }
    await cached.promise;
    return mongoose;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

module.exports = connectDB;
