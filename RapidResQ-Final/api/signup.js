// Dedicated slim signup serverless bundle — routed before /api/(.*) in vercel.json.
const { slimSignup } = require('../backend/slimAuthApp');

module.exports = slimSignup();
