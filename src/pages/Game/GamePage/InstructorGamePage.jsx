// pages/Game/InstructorGamePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as competitionApi from "../../../utilities/competition-api";
import socket from "../../../../socket";
import styles from "./GamePage.module.scss";

export default function InstructorGamePage() {
  const { id: competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Initial fetch
  useEffect(() => {
    async function fetchCompetition() {
      try {
        const comp = await competitionApi.getById(competitionId);
        const c = comp.competition || comp;
        setCompetition(c);
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

  // Socket setup
  useEffect(() => {
    if (!competitionId) return;

    console.log("👨‍🏫 Instructor connecting to socket, competitionId:", competitionId);
    socket.emit("join-competition", { competitionId, role: "instructor" });

    socket.on("connect", () => {
      console.log("✅ Instructor socket connected:", socket.id);
    });

    socket.on("player-joined", (updatedCompetition) => {
      console.log("🎮 Player joined:", updatedCompetition);
      setCompetition(updatedCompetition);
    });

    // Optional: instructor chooses a question
    socket.on("competition-started", () => {
      console.log("🚀 Competition started, redirecting to board...");
      navigate(`/competitions/${competitionId}/board`);
    });

    return () => {
      socket.off("connect");
      socket.off("player-joined");
      socket.off("competition-started");
    };
  }, [competitionId, navigate]);

  if (loading || !competition) return <p>Loading competition...</p>;

  const joinedCount = competition.teams.reduce((acc, t) => acc + t.members.length, 0);

  return (
    <div className={styles.gamePage}>
      <Navbar />
      <main>
        <h1>Competition Setup</h1>
        {message && <p className={styles.message}>{message}</p>}

        <p>Share this code with players:</p>
        <code>{competition.joinCode}</code>

        <h2>Teams</h2>
        <ul>
          {competition.teams.map((t) => (
            <li key={t._id}>
              {t.name || "Unnamed"} –{" "}
              {competition.identifierType === "colors" ? t.color : `#${t.number}`}{" "}
              ({t.members.length > 0 ? "✅ joined" : "❌ empty"})
            </li>
          ))}
        </ul>

        <p>Waiting for players... ({joinedCount}/{competition.teams.length})</p>
      </main>
      <Footer />
    </div>
  );
}
