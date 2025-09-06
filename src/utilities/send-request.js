import { getToken } from './users-service';

export default async function sendRequest(url, method = 'GET', payload = null, isPublic = false) {
  const options = { method, headers: {} };

  if (payload) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(payload);
  }

  // ✅ Add token logic
  if (!isPublic) {
    let token = localStorage.getItem('playerToken');
    if (!token) {
      token = localStorage.getItem('token'); // fallback for instructor
    }
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
