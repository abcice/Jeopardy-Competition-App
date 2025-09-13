import { useEffect, useState, useMemo } from "react";
import * as playerApi from "../../../utilities/player-competition-api";
import styles from "./RankingPage.module.scss";

export default function PlayerRankingContent({ playerToken: propToken }) {
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameFinished, setGameFinished] = useState(false);

  // --- Token handling ---
  const storedToken = localStorage.getItem("playerToken");
  const token = propToken || storedToken;

  // --- Decode token to get teamId and competitionId ---
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const myTeamId = payload?.teamId;
  const competitionId = payload?.competitionId;

  // --- Fetch competition ---
  useEffect(() => {
    if (!competitionId || !token) return;

    const fetchCompetition = async () => {
      try {
        setLoading(true);
        const res = await playerApi.getCompetition(competitionId);
        setCompetition(res.competition);

        const totalQuestions = res.competition.jeopardy.categories.reduce(
          (acc, cat) => acc + cat.questions.length,
          0
        );
        setGameFinished(res.competition.answeredQuestions.length === totalQuestions);
      } catch (err) {
        console.error("Failed to fetch competition:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
    const interval = setInterval(fetchCompetition, 3000);
    return () => clearInterval(interval);
  }, [competitionId, token]);

  if (loading) return <p>Loading rankings...</p>;
  if (!competition) return <p>❌ Competition not found</p>;

  // --- Sort teams by score ---
  const sortedTeams = [...competition.teams].sort((a, b) => b.score - a.score);
  const winnerTeam = gameFinished ? sortedTeams[0] : null;

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
            className={`${styles.teamItem} ${
              team._id === myTeamId ? styles.myTeam : ""
            } ${gameFinished && idx === 0 ? styles.winnerGlow : ""}`}
          >
            <span className={styles.rank}>{idx + 1}.</span>
            <span className={styles.name}>{team.name}</span>
            <span className={styles.score}>{team.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
