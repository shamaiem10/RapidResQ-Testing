// Dedicated function: must run before SPA /api rewrite (see vercel.json + handle: filesystem).
const { slimLogin } = require('../backend/slimAuthApp');

module.exports = slimLogin();
