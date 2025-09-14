// pages/Game/InstructorGamePage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as competitionApi from "../../../utilities/competition-api";
import socket from "../../../utilities/socket";
import styles from "./InstructorGamePage.module.scss";


export default function InstructorGamePage() {
  const { id: competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // --- Initial fetch ---
  useEffect(() => {
    async function fetchCompetition() {
      try {
        const comp = await competitionApi.getById(competitionId);
        const c = comp.competition || comp;
        setCompetition(c);
        setTeams(c.teams || []);
        setLoading(false);

        if (c.status === "active") {
          navigate(`/competitions/${competitionId}/board`);
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load competition");
        setLoading(false);
      }
    }
    fetchCompetition();
  }, [competitionId, navigate]);

  // --- Stable socket handlers ---
  const handleConnect = useCallback(() => {
    console.log("✅ Instructor socket connected:", socket.id);
    socket.emit("join-competition", { competitionId, role: "instructor" });
  }, [competitionId]);

  const handleCompetitionUpdate = useCallback((data) => {
    console.log("📢 Instructor received competition update:", data);

    if (data.teams) {
      setTeams(data.teams);
    }
    setCompetition((prev) => ({ ...prev, ...data }));
  }, []);

  // --- Socket setup ---
  useEffect(() => {
    if (!competitionId) return;
    if (!socket.connected) socket.connect();

    socket.on("connect", handleConnect);
    socket.on("competition-updated", handleCompetitionUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("competition-updated", handleCompetitionUpdate);
    };
  }, [competitionId, handleConnect, handleCompetitionUpdate]);
  useEffect(() => {
  if (teams.length > 0) {
    const allJoined = teams.every((t) => (t.members?.length || 0) > 0);
    if (allJoined) {
      // Automatically move instructor to QuestionBoard
      navigate(`/competitions/${competitionId}/board`);
    }
  }
}, [teams, competitionId, navigate]);


  // --- Render ---
  if (loading || !competition) return <p>Loading competition...</p>;

  const joinedCount = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

  return (
    <div className={styles.gamePage}>
      <Navbar />
      <main>
        <h1>Competition Setup</h1>
        {message && <p className={styles.message}>{message}</p>}

        <p>Share this code with players:</p>
        <div className={styles.joinCodeCard}>{competition.joinCode}</div>

        <h2>Teams</h2>
        <ul>
        {teams.map((t) => (
          <li key={t._id}>
            {t.name || "Unnamed"} –{" "}
            {competition.identifierType === "colors" ? t.color : `#${t.number}`}
            <div className="status">
              <div className={`dot ${t.members?.length > 0 ? "joined" : "empty"}`}></div>
              {t.members?.length > 0 ? "Joined" : "Empty"}
            </div>
          </li>
        ))}
      </ul>


        <p className={styles.waitingCounter}>
          Waiting for players... ({joinedCount}/{teams.length})
        </p>
      </main>
      <Footer />
    </div>
  );
}
