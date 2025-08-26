// utilities/jeopardy.js
import sendRequest from './send-request';

const BASE_URL = '/api/jeopardies';

// Jeopardy Games
export function getAll() {
  return sendRequest(BASE_URL);
}

export function getById(id) {
  return sendRequest(`${BASE_URL}/${id}`);
}

export function create(data) {
  // data = { title, categories, author }
  return sendRequest(BASE_URL, 'POST', data);
}

export function update(id, data) {
  // data = { title, categories }
  return sendRequest(`${BASE_URL}/${id}`, 'PUT', data);
}

export function deleteJeopardy(id) {
  return sendRequest(`${BASE_URL}/${id}`, 'DELETE');
}

// Categories
export function getCategories(id) {
  return sendRequest(`${BASE_URL}/${id}/categories`);
}

export function addCategory(id, name) {
  return sendRequest(`${BASE_URL}/${id}/categories`, 'POST', { name });
}

export function updateCategory(id, categoryId, name) {
  return sendRequest(`${BASE_URL}/${id}/categories/${categoryId}`, 'PUT', { name });
}

export function deleteCategory(id, categoryId) {
  return sendRequest(`${BASE_URL}/${id}/categories/${categoryId}`, 'DELETE');
}

// Questions
export function getQuestions(id, categoryId) {
  return sendRequest(`${BASE_URL}/${id}/categories/${categoryId}/questions`);
}

export function addQuestion(id, categoryId, data) {
  // data = { text, points, dailyDouble }
  return sendRequest(`${BASE_URL}/${id}/categories/${categoryId}/questions`, 'POST', { ...data, categoryId });
}

export function updateQuestion(id, categoryId, questionId, data) {
  // data = { text?, points?, dailyDouble? }
  return sendRequest(`${BASE_URL}/${id}/categories/${categoryId}/questions/${questionId}`, 'PUT', { ...data, categoryId });
}

export function deleteQuestion(id, categoryId, questionId) {
  return sendRequest(`${BASE_URL}/${id}/categories/${categoryId}/questions/${questionId}`, 'DELETE');
}
