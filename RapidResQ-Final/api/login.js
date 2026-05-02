// Dedicated slim login serverless bundle — routed before /api/(.*) in vercel.json.
const { slimLogin } = require('../backend/slimAuthApp');

module.exports = slimLogin();
