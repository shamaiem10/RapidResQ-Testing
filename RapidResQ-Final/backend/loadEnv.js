/**
 * Load env from predictable paths instead of cwd.
 * Running `node backend/server.js` from RapidResQ-Final makes cwd the repo root —
 * dotenv default would only load ./.env there, ignoring backend/.env.
 */
const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
  dotenv.config({ path: path.join(__dirname, '.env') });
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
}

module.exports = loadEnv;
