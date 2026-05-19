import axios from 'axios';

// In a production Vite build, import.meta.env.PROD is true.
// VITE_API_URL can be set in Render environment variables to override.
let envApiUrl = import.meta.env.VITE_API_URL;
// Ensure that the URL always ends with /api if it doesn't already
if (envApiUrl && !envApiUrl.endsWith('/api')) {
  // Strip trailing slash if present before appending /api
  envApiUrl = envApiUrl.replace(/\/$/, '') + '/api';
}

const baseURL =
  envApiUrl ||
  (import.meta.env.PROD
    ? 'https://invertis-feedback-system-0chx.onrender.com/api'
    : 'http://localhost:5000/api');

const api = axios.create({ baseURL });

// Auto-attach the token from local storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tlfq_platform_session');
  // Strict check for valid token strings
  if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Ensure no stale header is sent
    delete config.headers.Authorization;
  }
  return config;
});

export default api;
