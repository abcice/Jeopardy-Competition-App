import { getToken } from './users-service';

export default async function sendRequest(url, method = 'GET', payload = null, skipToken = false) {
  const options = { method };
  if (payload) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(payload);
  }

if (!skipToken) {
  const token = getToken(); // for instructors
  if (token) {
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${token}`;
  }
} else {
  // optional: playerToken
  const playerToken = localStorage.getItem('playerToken');
  if (playerToken) {
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${playerToken}`;
  }
}


  const res = await fetch(url, options);
  if (res.ok) return res.json();
  const errorText = await res.text();
  console.error("Fetch error: status", res.status, errorText);
  throw new Error(errorText || 'Bad Request');
}
