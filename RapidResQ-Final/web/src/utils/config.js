// API base URL for axios/fetch.

const rawEnv = String(process.env.REACT_APP_API_URL || '')
  .trim()
  .replace(/\/$/, '');

const pointsToLoopback =
  !rawEnv || /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(rawEnv);

function resolvedBase() {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    if (pointsToLoopback) return 'http://localhost:5000/api';
    return rawEnv;
  }

  // Production (Vercel / build): localhost env vars must not win — browsers block those requests.
  if (pointsToLoopback) return '/api';

  // HTTPS site + http-only API URL → blocked by the browser (“Failed to fetch”).
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    rawEnv.startsWith('http://')
  ) {
    return '/api';
  }

  return rawEnv || '/api';
}

const API_URL = resolvedBase();

export default API_URL;
