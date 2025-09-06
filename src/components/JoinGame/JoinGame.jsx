// src/components/JoinGame/JoinGame.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as playerCompetitionApi from "../../utilities/player-competition-api";

export default function JoinGame() {
  const navigate = useNavigate();
  const { code: paramCode } = useParams();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

const handleJoin = async () => {
  try {
    console.log("Joining with code:", code.trim());

    // Step 1: call joinByCode to validate code and get token
    const comp = await playerCompetitionApi.joinByCode(code.trim());
    console.log("Competition response:", comp);

    // Step 2: save the token immediately
    if (comp.playerToken) {
      localStorage.setItem("playerToken", comp.playerToken);
      console.log("Player token saved:", comp.playerToken);
    }

    // Step 3: redirect player to setup page where they pick a team
    navigate(`/competition/${comp.id}/player/setup`);
  } catch (err) {
    console.error(err);
    setError("❌ Invalid code");
  }
};

  // Auto-join if paramCode is present in URL
  useEffect(() => {
    if (paramCode) {
      setCode(paramCode);
      handleJoin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCode]);

  return (
    <div className="joinGame">
      <h3>Join a Jeopardy Game</h3>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter game code"
      />
      <button onClick={handleJoin}>Join</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
