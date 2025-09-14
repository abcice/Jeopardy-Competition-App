import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../utilities/socket"; // ✅ import socket
import * as playerCompetitionApi from "../../utilities/player-competition-api";
import styles from "./JoinGame.module.scss"

const JoinGame = ({ setPlayerToken }) => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [competition, setCompetition] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [error, setError] = useState("");
  const [localPlayerToken, setLocalPlayerToken] = useState("");

  const handleFetchCompetition = async () => {
  try {
    const data = await playerCompetitionApi.joinByCode(joinCode);
    setCompetition(data);
    const token = data.playerToken;
    setPlayerToken(token); // save token
    localStorage.setItem("playerToken", token);
    setError("");

    // Navigate to PlayerGamePage immediately
    navigate(`/competition/${data.id}/player/setup`);
  } catch (err) {
    setError(err.message || "Error fetching competition");
    setCompetition(null);
  }
};


  const handleJoinTeam = async () => {
    if (!selectedTeamId) return setError("Please select a team");
    try {
      const socketId = socket.id; // ✅ make sure socket is connected
      const data = await playerCompetitionApi.joinTeam(
        competition.id,
        selectedTeamId,
        socketId
      );

      localStorage.setItem("playerToken", data.playerToken);
      setPlayerToken(data.playerToken);

      navigate(`/competition/${competition.id}/player/setup`);
    } catch (err) {
      setError(err.message || "Error joining team");
    }
  };

  return (
    <div className={styles.joinGameCard}>
      <h2 className={styles.title}>Join Competition</h2>
      {!competition ? (
        <div className={styles.fetchSection}>
          <input
            type="text"
            placeholder="Enter join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleFetchCompetition} className={styles.button}>
            Fetch Competition
          </button>
        </div>
      ) : (
        <div className={styles.teamSection}>
          <h3>{competition.name}</h3>
          <p>Select your team:</p>
          <div className={styles.teams}>
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
          </div>
          <button onClick={handleJoinTeam} className={styles.button}>
            Join Team
          </button>
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default JoinGame;
