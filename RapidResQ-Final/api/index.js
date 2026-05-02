// Thin Vercel entry: keep only this file under /api so nested modules are not deployed
// as separate Serverless Functions (see https://vercel.com/docs/functions/routing).
module.exports = require('../backend');
