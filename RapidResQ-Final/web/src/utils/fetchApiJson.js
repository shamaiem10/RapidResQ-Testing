import API_URL from './config';

/**
 * POST/GET helpers that explain failures instead of only "network error".
 * @param {string} path - e.g. "login", "/signup"
 * @param {RequestInit} init
 */
export async function fetchApiJson(path, init = {}) {
  const slug = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_URL}${slug}`;
  let response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    const m = err && err.message ? err.message : 'Unknown';
    throw new Error(
      m === 'Failed to fetch'
        ? `${m} (${url}). Often: offline, wrong REACT_APP_API_URL, or http blocked on https.`
        : `${m} (${url})`,
    );
  }

  const text = await response.text();
  let data = {};
  if (text) {
    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      throw new Error(
        `HTTP ${response.status} from ${url} — expected JSON but got HTML or other. First bytes: ${text.slice(0, 80).replace(/\s+/g, ' ')}…`,
      );
    }
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`HTTP ${response.status} invalid JSON from ${url}: ${text.slice(0, 80)}…`);
    }
  }

  return { response, data, url };
}
