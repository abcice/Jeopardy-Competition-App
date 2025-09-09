import sendRequest from "./send-request.js";

const BASE_URL = "/api/player/competitions";

// ✅ Public join
export function joinByCode(joinCode) {
  return sendRequest(`/api/player/public/code/${joinCode}`, "GET");
}

// ✅ Protected
export function getById(id) {
  return sendRequest(`${BASE_URL}/${id}`, "GET");
}

export function joinTeam(competitionId, teamId) {
  return sendRequest(`${BASE_URL}/${competitionId}/join-team`, "POST", { teamId });
}

export function buzz(competitionId, questionId) {
  return sendRequest(`${BASE_URL}/${competitionId}/buzz`, "POST", { questionId });
}

export function getCompetition(competitionId) {
  return sendRequest(`${BASE_URL}/${competitionId}`, "GET");
}
