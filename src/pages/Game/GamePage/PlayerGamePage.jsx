// pages/Game/PlayerGamePage.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as playerCompetitionApi from "../../../utilities/player-competition-api";
import socket from "../../../utilities/socket";
import styles from "./GamePage.module.scss";

export default function PlayerGamePage({ playerToken }) {
  const { id: competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [joinedTeamId, setJoinedTeamId] = useState(null);

  // --- Fetch competition ---
  useEffect(() => {
    async function fetchCompetition() {
      try {
        console.log("📡 Fetching competition:", competitionId);
        const comp = await playerCompetitionApi.getCompetition(competitionId);
        console.log("✅ Competition fetched:", comp);
        setCompetition(comp);

        // Merge teams without overwriting socket updates
        setTeams(prevTeams => (prevTeams.length ? prevTeams : comp.teams || []));
      } catch (err) {
        console.error("❌ Failed to fetch competition:", err);
        setMessage("❌ Failed to load competition");
      } finally {
        setLoading(false);
      }
    }
    if (playerToken) fetchCompetition();
  }, [competitionId, playerToken]);

  // --- Socket handlers ---
  const handleConnect = useCallback(() => {
    console.log("🔌 Player socket connected:", socket.id);
    socket.emit("join-competition", { competitionId, role: "player" });
  }, [competitionId]);

  const handleCompetitionUpdate = useCallback((data) => {
    console.log("📢 Player received competition update:", data);
    setCompetition(prev => ({ ...prev, ...data }));
    if (data.teams) {
      console.log("📋 Updating teams state:", data.teams);
      setTeams(data.teams);
    }
  }, []);

  const handleQuestionChosen = useCallback(({ question }) => {
    console.log("🚀 Instructor chose question:", question);


    // Navigate player
    navigate(`/competitions/${competitionId}/question/player`);
  },
  [competitionId, navigate]
);



  // --- Team assignment ---
  useEffect(() => {
    const teamAssignedHandler = ({ teamId }) => {
      console.log("🎉 Team assignment event received. TeamId:", teamId);
      setJoinedTeamId(teamId);
    };

    socket.on("team-assigned", teamAssignedHandler);
    return () => socket.off("team-assigned", teamAssignedHandler);
  }, []);

  // --- Socket setup ---
  useEffect(() => {
    if (!competitionId) return;
    if (!socket.connected) {
      console.log("⚡ Connecting socket...");
      socket.connect();
    }

    socket.on("connect", handleConnect);
    socket.on("competition-updated", handleCompetitionUpdate);
    socket.on("question-chosen", handleQuestionChosen);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("competition-updated", handleCompetitionUpdate);
      socket.off("question-chosen", handleQuestionChosen);
    };
  }, [competitionId, handleConnect, handleCompetitionUpdate, handleQuestionChosen]);

  // --- Resolve joined team ---
  const joinedTeam = useMemo(() => {
    if (!joinedTeamId) return null;
    return teams.find(t => t._id === joinedTeamId) || competition?.teams?.find(t => t._id === joinedTeamId) || null;
  }, [joinedTeamId, teams, competition]);

  console.log("🧐 Current state:", {
    competition,
    teams,
    joinedTeamId,
    joinedTeam,
  });

  // --- Render ---
  if (loading) return <p>Loading competition...</p>;
  if (!competition) return <p>❌ Competition not found</p>;

  return (
    <div className={styles.gamePage}>
      <Navbar />
      <main>
        {joinedTeam ? (
          <p>
            ✅ You were assigned to team: <strong>{joinedTeam.name}</strong>. <br />
            Waiting for the instructor to start...
          </p>
        ) : (
          <p>⚠️ You are not assigned to a team yet. Please wait.</p>
        )}

        {message && <p className={styles.message}>{message}</p>}
      </main>
      <Footer />
    </div>
  );
}
