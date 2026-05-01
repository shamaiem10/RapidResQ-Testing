// MongoDB connection (Atlas) — serverless-friendly cache for Vercel

const mongoose = require('mongoose');

let cached = global.__rapidresqMongoose;
if (!cached) {
  cached = global.__rapidresqMongoose = { conn: null, promise: null };
}

/**
 * Reuse the connection across lambda invocations (Vercel / AWS Lambda).
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error('MONGO_URI is not set. Add it to your environment (e.g. .env locally, Vercel Project Settings).');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoURI)
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;
