import sendRequest from './send-request';

const BASE_URL = '/api/player/competitions';

// Join competition by code (public)
export function joinByCode(joinCode) {
  return sendRequest(`${BASE_URL}/code/${joinCode}`, 'GET', null, true);
}

// Join a team (player, requires token)
export async function joinTeam(req, res) {
  try {
    const { id: competitionId } = req.params;
    const { teamId } = req.body;

    // (optional: validate team exists)
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ msg: "Competition not found" });
    }

    const playerToken = createPlayerToken({ competitionId, teamId });

    res.json({ team: teamId, playerToken });
  } catch (err) {
    console.error("joinTeam error:", err);
    res.status(500).json({ msg: "Server error" });
  }
}

// Buzz (player requires token)
export function buzz(competitionId, questionId) {
  return sendRequest(
    `${BASE_URL}/${competitionId}/buzz`,
    'POST',
    { questionId }
  );
}

// Fetch competition state (protected)
export function getCompetition(competitionId) {
  return sendRequest(`${BASE_URL}/${competitionId}`);
}
