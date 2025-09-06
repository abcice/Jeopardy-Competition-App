// pages/Game/InstructorGamePage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as competitionApi from "../../../utilities/competition-api";
import styles from "./GamePage.module.scss";

export default function InstructorGamePage() {
  const { id: competitionId } = useParams();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
  async function fetchCompetition() {
    try {
      const comp = await competitionApi.getById(competitionId);
      // 👇 if API nests competition inside "competition", unwrap it
      setCompetition(comp.competition || comp);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load competition");
      setLoading(false);
    }
  }
  fetchCompetition();
}, [competitionId]);


  if (loading || !competition) return <p>Loading competition...</p>;

  return (
    <div className={styles.gamePage}>
      <Navbar />
      <main>
        <h1>Competition Setup</h1>
        {message && <p className={styles.message}>{message}</p>}

        <p>Share this link with players:</p>
        <code>{`${window.location.origin}/join/${competition.joinCode}`}</code>

        <p>Or tell them to enter this code:</p>
        <code>{competition.joinCode}</code>

        <h2>Teams</h2>
        <ul>
          {competition.teams.map((t) => (
            <li key={t._id}>
              {t.name || "Unnamed"} –{" "}
              {competition.identifierType === "colors"
                ? t.color
                : `#${t.number}`}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
