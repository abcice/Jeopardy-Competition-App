import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as playerCompetitionApi from "../../utilities/player-competition-api";

const JoinGame = ({ setPlayerToken }) => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [competition, setCompetition] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [error, setError] = useState("");
  const [localPlayerToken, setLocalPlayerToken] = useState("");

  // Step 1: Fetch competition by join code
  const handleFetchCompetition = async () => {
    try {
      const data = await playerCompetitionApi.joinByCode(joinCode);
      setCompetition(data);
      const token = data.playerToken;
      setPlayerToken(token);
      setLocalPlayerToken(token);
      setError("");
    } catch (err) {
      setError(err.message || "Error fetching competition");
      setCompetition(null);
    }
  };

  // Step 2: Join selected team
  const handleJoinTeam = async () => {
    if (!selectedTeamId) {
      setError("Please select a team");
      return;
    }
    try {
      const data = await playerCompetitionApi.joinTeam(competition.id, selectedTeamId);

      localStorage.setItem("playerToken", data.playerToken);
      setPlayerToken(data.playerToken);

      navigate(`/competition/${competition.id}/player/setup`);
    } catch (err) {
      setError(err.message || "Error joining team");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
      <h2>Join Competition</h2>
      {!competition ? (
        <>
          <input
            type="text"
            placeholder="Enter join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            style={{ padding: "0.5rem", fontSize: "1rem" }}
          />
          <button onClick={handleFetchCompetition} style={{ marginLeft: "1rem" }}>
            Fetch Competition
          </button>
        </>
      ) : (
        <>
          <h3>{competition.name}</h3>
          <p>Select your team:</p>
          {competition.teams.map((team) => (
            <div key={team._id}>
              <input
                type="radio"
                id={team._id}
                name="team"
                value={team._id}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              />
              <label htmlFor={team._id}>
                {team.name} ({team.color})
              </label>
            </div>
          ))}
          <button onClick={handleJoinTeam} style={{ marginTop: "1rem" }}>
            Join Team
          </button>
        </>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default JoinGame;
