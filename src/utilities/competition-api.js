// utilities/competition-api.js
import sendRequest from './send-request';

const BASE_URL = '/api/competitions';

// Competitions
export function getAll() {
  return sendRequest(BASE_URL);
}

export function getById(id) {
  return sendRequest(`${BASE_URL}/${id}`);
}

// utilities/competition-api.js
  export function create(payload) {
    return sendRequest(BASE_URL, 'POST', payload);
  }



export function deleteCompetition(id) {
  return sendRequest(`${BASE_URL}/${id}`, 'DELETE');
}

// Teams
export function addTeam(id, teamData) {
  // teamData = { name, color, number }
  return sendRequest(`${BASE_URL}/${id}/teams`, 'POST', teamData);
}

export function updateTeamScore(id, teamId, points) {
  return sendRequest(`${BASE_URL}/${id}/teams/score`, 'PUT', { teamId, points });
}

// Current Question
export function setCurrentQuestion(id, questionId) {
  return sendRequest(`${BASE_URL}/${id}/current-question`, 'PUT', { questionId });
}

export function markCorrect(id, teamId, bid) {
  return sendRequest(`${BASE_URL}/${id}/mark-correct`, 'PUT', { teamId, bid });
}

export function markWrong(id, teamId, bid) {
  return sendRequest(`${BASE_URL}/${id}/mark-wrong`, 'PUT', { teamId, bid });
}

export function skipQuestion(id) {
  return sendRequest(`${BASE_URL}/${id}/skip-question`, 'PUT');
}

// Buzz (optional logging)
export function recordBuzz(id, teamId, questionId) {
  return sendRequest(`${BASE_URL}/${id}/buzz`, 'POST', { teamId, questionId });
}

// Status
export function updateStatus(id, status) {
  return sendRequest(`${BASE_URL}/${id}/status`, 'PUT', { status });
}
