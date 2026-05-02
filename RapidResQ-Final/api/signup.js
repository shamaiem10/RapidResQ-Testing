// Dedicated function: must run before SPA /api rewrite (see vercel.json + handle: filesystem).
const { slimSignup } = require('../backend/slimAuthApp');

module.exports = slimSignup();
