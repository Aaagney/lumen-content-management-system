import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Shared axios instance. If a token has been stored (e.g. by a future
// login page, or manually for testing), it is attached as a Bearer token
// on every request so the already-implemented backend JWT auth works.
// Requests made with no token stored behave exactly as before.
const http = axios.create({ baseURL: API_BASE_URL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Decodes the `id` from a stored JWT without adding a JWT library —
// returns null if there's no token or it can't be parsed.
export function getCurrentUserId() {
  const token = localStorage.getItem('lumen_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id ?? null;
  } catch {
    return null;
  }
}

export default http;
