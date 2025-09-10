// pages/Game/PlayerGamePage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as playerCompetitionApi from "../../../utilities/player-competition-api";
import socket from "../../../utilities/socket";
import { jwtDecode } from "jwt-decode";
import styles from "./GamePage.module.scss";

export default function PlayerGamePage({ playerToken, setPlayerToken }) {
  const { id: competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedButtons, setSelectedButtons] = useState({});
  const [identifierType, setIdentifierType] = useState("colors");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // --- Fetch competition ---
  useEffect(() => {
    async function fetchCompetition() {
      try {
        const comp = await playerCompetitionApi.getCompetition(
          competitionId,
          playerToken
        );
        setCompetition(comp);
        setIdentifierType(comp.identifierType || "colors");
        setTeams(comp.teams || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load competition");
        setLoading(false);
      }
    }
    if (playerToken) fetchCompetition();
  }, [competitionId, playerToken]);

  // --- Stable socket handlers ---
  const handleConnect = useCallback(() => {
    console.log("✅ Player socket connected:", socket.id);
    socket.emit("join-competition", { competitionId, role: "player" });
  }, [competitionId]);

  const handleCompetitionUpdate = useCallback((data) => {
    console.log("📢 Player received competition update:", data);

    // Update competition state safely
    setCompetition((prev) => ({ ...prev, ...data }));

    // Update teams only if data includes them
    if (data.teams) setTeams(data.teams);
  }, []);

  const handleQuestionChosen = useCallback(
    (question) => {
      console.log("🚀 Instructor chose question:", question);
      navigate(`/competitions/${competitionId}/question/player`, {
        state: { question },
      });
    },
    [competitionId, navigate]
  );

  // --- Socket setup ---
  useEffect(() => {
    if (!competitionId) return;
    if (!socket.connected) socket.connect();

    socket.on("connect", handleConnect);
    socket.on("competition-updated", handleCompetitionUpdate);
    socket.on("question-chosen", handleQuestionChosen);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("competition-updated", handleCompetitionUpdate);
      socket.off("question-chosen", handleQuestionChosen);
    };
  }, [competitionId, handleConnect, handleCompetitionUpdate, handleQuestionChosen]);

  // --- Team select handler ---
  const handleSelect = async (teamId) => {
    console.log("📌 Player selecting team:", teamId);

    socket.emit("join-competition", { competitionId, role: "player", teamId });

    try {
      const data = await playerCompetitionApi.joinTeam(
        competitionId,
        teamId
      );

      if (data.playerToken) {
        localStorage.setItem("playerToken", data.playerToken);
        setPlayerToken(data.playerToken);
      }

      // Update selected buttons UI
      setSelectedButtons((prev) => ({ ...prev, [teamId]: true }));

      // Update local teams state safely
      setTeams((prevTeams) =>
        prevTeams.map((t) =>
          t._id === teamId
            ? { ...t, members: [...(t.members || []), playerToken] }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to register selection");
    }
  };

  // --- Render ---
  if (loading || !competition) return <p>Loading competition...</p>;

  const playerTokenPayload = jwtDecode(playerToken);
  const joinedTeam = teams.find((t) => t._id === playerTokenPayload.teamId);
  const isTaken = (team) => (team.members?.length || 0) > 0;

  return (
    <div className={styles.gamePage}>
      <Navbar />
      <main>
        <h1>Select Your Team Identifier</h1>
        {message && <p className={styles.message}>{message}</p>}

        {joinedTeam ? (
          <p>
            ✅ You joined team: {joinedTeam.name}. Waiting for the instructor to start...
          </p>
        ) : (
          <div className={styles.buttonsContainer}>
            {teams.map((team) => {
              const taken = isTaken(team);
              return (
                <button
                  key={team._id}
                  className={styles.teamButton}
                  style={{
                    backgroundColor: identifierType === "colors" ? team.color : undefined,
                    color: identifierType === "colors" ? "white" : "black",
                    cursor: taken ? "not-allowed" : "pointer",
                    opacity: taken ? 0.7 : 1,
                    position: "relative",
                  }}
                  onClick={() => !taken && handleSelect(team._id)}
                >
                  {identifierType === "colors" ? team.color : `#${team.number}`}
                  {taken && (
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        color: "black",
                        background: "rgba(255,255,255,0.7)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      TAKEN
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
