// frontend/src/utils/config.js

// Use Vercel environment variable if set, otherwise fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default API_URL;