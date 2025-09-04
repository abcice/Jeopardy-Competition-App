import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as competitionApi from "../../../utilities/competition-api";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import styles from "./RankingPage.module.scss";

export default function RankingContent({ competitionId }) {
  const [competition, setCompetition] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const navigate = useNavigate();

  const fetchCompetition = async () => {
    try {
      const res = await competitionApi.getById(competitionId);
      setCompetition(res.competition);

      const totalQuestions = res.competition.jeopardy.categories.reduce(
        (acc, cat) => acc + cat.questions.length,
        0
      );
      setGameFinished(res.competition.answeredQuestions.length === totalQuestions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompetition();
    const interval = setInterval(fetchCompetition, 3000);
    return () => clearInterval(interval);
  }, [competitionId]);

  if (!competition) return <p>Loading rankings...</p>;

  const sortedTeams = [...competition.teams].sort((a, b) => b.score - a.score);
  const winnerTeam = gameFinished ? sortedTeams[0] : null;

  // ✅ Handler for finishing the game
  const handleFinishGame = async () => {
    try {
      await competitionApi.updateStatus(competitionId, "finished");
      navigate("/"); // back to dashboard
    } catch (err) {
      console.error("Failed to complete game", err);
    }
  };

  return (
    <div className={`${styles["ranking-page"]} ${gameFinished ? styles.finished : ""}`}>
      <h2>{gameFinished ? "🏆 Game Over! Winner:" : "Current Rankings"}</h2>

      {gameFinished && winnerTeam && (
        <div className={styles.winner}>
          <span>{winnerTeam.name}</span>
        </div>
      )}

      <ul className={styles.teamList}>
        {sortedTeams.map((team, idx) => (
          <li
            key={team._id}
            className={`${styles.teamItem} ${gameFinished && idx === 0 ? styles.winnerGlow : ""}`}
          >
            <span className={styles.rank}>{idx + 1}.</span>
            <span className={styles.name}>{team.name}</span>
            <span className={styles.score}>{team.score}</span>
          </li>
        ))}
      </ul>

      {gameFinished && (
        <button className={styles.finishButton} onClick={handleFinishGame}>
          Finish Game & Return to Dashboard
        </button>
      )}
    </div>
  );
}
