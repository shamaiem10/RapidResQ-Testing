// API base URL for fetch/axios.
// - Local CRA dev: API runs on port 5000 (see api/server.js).
// - Vercel (single app): same-origin `/api` unless REACT_APP_API_URL overrides.

const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api');

export default API_URL;
