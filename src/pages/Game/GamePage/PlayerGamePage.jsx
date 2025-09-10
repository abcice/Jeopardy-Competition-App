// pages/Game/PlayerGamePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as playerCompetitionApi from "../../../utilities/player-competition-api";
import socket from "../../../../socket";
import { jwtDecode } from "jwt-decode";
import styles from "./GamePage.module.scss";

export default function PlayerGamePage({ playerToken }) {
  const { id: competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedButtons, setSelectedButtons] = useState({});
  const [identifierType, setIdentifierType] = useState("colors");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch competition
  useEffect(() => {
    async function fetchCompetition() {
      try {
        const comp = await playerCompetitionApi.getCompetition(competitionId, playerToken);
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

  // Socket setup
  useEffect(() => {
    if (!competitionId) return;

    console.log("🎮 Player connecting to socket, competitionId:", competitionId);
    socket.emit("join-competition", { competitionId, role: "player" });

    socket.on("connect", () => {
      console.log("✅ Player socket connected:", socket.id);
    });

    socket.on("competition-updated", (updatedCompetition) => {
      console.log("📢 Competition updated:", updatedCompetition);
      setCompetition(updatedCompetition);
      setTeams(updatedCompetition.teams || []);
    });

    // Instructor chooses a question
    socket.on("question-chosen", (question) => {
      console.log("🚀 Instructor chose question:", question);
      navigate(`/competitions/${competitionId}/question/player`, { state: { question } });
    });

    return () => {
      socket.off("connect");
      socket.off("competition-updated");
      socket.off("question-chosen");
    };
  }, [competitionId, navigate]);

  // Handle selecting a team
  const handleSelect = async (teamId) => {
    if (selectedButtons[teamId]) return;

    console.log("📌 Player selecting team:", teamId);
    socket.emit("join-competition", { competitionId, role: "player", teamId });

    try {
      const data = await playerCompetitionApi.joinTeam(competitionId, teamId);

      if (data.playerToken) {
        localStorage.setItem("playerToken", data.playerToken);
        console.log("💾 Saved playerToken:", data.playerToken);
        const decoded = jwtDecode(data.playerToken);
        console.log("🔑 Decoded token:", decoded);
      }

      setSelectedButtons((prev) => ({ ...prev, [teamId]: true }));
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to register selection");
    }
  };

  if (loading || !competition) return <p>Loading competition...</p>;

  const playerTokenPayload = jwtDecode(playerToken);
  const joinedTeam = (competition.teams || []).find(
    (t) => t._id === playerTokenPayload.teamId
  );

  return (
    <div className={styles.gamePage}>
      <Navbar />
      <main>
        <h1>Select Your Team Identifier</h1>

        {message && <p className={styles.message}>{message}</p>}

        {joinedTeam ? (
          <p>✅ You joined team: {joinedTeam.name}. Waiting for the instructor to start...</p>
        ) : (
          <div className={styles.buttonsContainer}>
            {teams.map((team) => {
              const disabled = !!selectedButtons[team._id];
              return (
                <button
                  key={team._id}
                  className={styles.teamButton}
                  style={{
                    backgroundColor: identifierType === "colors" ? team.color : undefined,
                    color: identifierType === "colors" ? "white" : "black",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.5 : 1,
                  }}
                  disabled={disabled}
                  onClick={() => handleSelect(team._id)}
                >
                  {identifierType === "colors" ? team.color : `#${team.number}`}
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