import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as competitionApi from "../../../utilities/competition-api";
import styles from "./QuestionPage.module.scss";

export default function QuestionPage() {
  const { competitionId } = useParams();

  const [competition, setCompetition] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [teamAnswering, setTeamAnswering] = useState(null); // team that buzzed first
  const [answerShown, setAnswerShown] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch competition data
  const fetchCompetition = async () => {
    try {
      const res = await competitionApi.getById(competitionId);
      setCompetition(res.competition);
      setCurrentQuestion(res.currentQuestionDetails);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load competition or question.");
    }
  };

  useEffect(() => {
    fetchCompetition();
    // Optionally: poll every few seconds to see new buzzes or question changes
    const interval = setInterval(fetchCompetition, 3000);
    return () => clearInterval(interval);
  }, [competitionId]);

  // Instructor-only handlers
  const handleCorrect = async () => {
    if (!teamAnswering) {
      setMessage("⚠️ No team selected to answer.");
      return;
    }
    try {
      await competitionApi.markCorrect(competitionId, teamAnswering._id, teamAnswering.bid || 0);
      setAnswerShown(true);
      await fetchCompetition(); // refresh scores
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to mark correct.");
    }
  };

  const handleWrong = async () => {
    if (!teamAnswering) {
      setMessage("⚠️ No team selected to answer.");
      return;
    }
    try {
      await competitionApi.markWrong(competitionId, teamAnswering._id, teamAnswering.bid || 0);
      setTeamAnswering(null); // allow next buzz
      setMessage("Teams may buzz again.");
      await fetchCompetition();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to mark wrong.");
    }
  };

  const handleSkip = async () => {
    try {
      await competitionApi.skipQuestion(competitionId);
      setAnswerShown(true);
      setTeamAnswering(null);
      await fetchCompetition();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to skip question.");
    }
  };

  if (!competition || !currentQuestion) return <p>Loading question...</p>;

  return (
    <>
      <Navbar />
      <main className={styles["question-page"]}>
        <h2>
          {currentQuestion.category.name} - {currentQuestion.points}
        </h2>
        <p className={styles.questionText}>{currentQuestion.text}</p>

        {answerShown && (
          <p className={styles.answer}>
            <strong>Answer:</strong> {currentQuestion.answer}
          </p>
        )}

        {teamAnswering ? (
          <p className={styles.teamAnswering}>
            Team answering: {teamAnswering.name}
          </p>
        ) : (
          <p className={styles.waiting}>Waiting for a team to buzz...</p>
        )}

        {message && <p className={styles.message}>{message}</p>}

        {/* Instructor-only controls */}
        <div className={styles.controls}>
          <button onClick={handleCorrect} disabled={!teamAnswering || answerShown}>Correct</button>
          <button onClick={handleWrong} disabled={!teamAnswering}>Wrong</button>
          <button onClick={handleSkip} disabled={answerShown}>Skip</button>
        </div>

        <h3>Scores:</h3>
        <ul>
          {competition.teams.map((team) => (
            <li key={team._id}>
              {team.name}: {team.score}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
