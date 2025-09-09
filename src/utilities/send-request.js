import { getToken } from './users-service.js';

export default async function sendRequest(url, method = 'GET', payload = null, isPublic = false, tokenOverride = null) {
  const options = { method, headers: {} };

  // Add payload if present
  if (payload) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(payload);
  }

  // Add Authorization header if needed
  if (!isPublic) {
    const token = tokenOverride || localStorage.getItem('playerToken') || localStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, options);

  if (res.ok) return res.json();

  const errorText = await res.text();
  console.error("Fetch error: status", res.status, errorText);
  throw new Error(errorText || 'Bad Request');
}
