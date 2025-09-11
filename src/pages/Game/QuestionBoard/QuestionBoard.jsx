// src/pages/Competition/QuestionBoard/QuestionBoard.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as competitionApi from "../../../utilities/competition-api";
import RankingContent from "../RankingPage/RankingContent";
import styles from "./QuestionBoard.module.scss";

export default function QuestionBoard() {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const [showRanking, setShowRanking] = useState(false);
  const [competition, setCompetition] = useState(null);
  const [jeopardy, setJeopardy] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const { competition } = await competitionApi.getById(competitionId);
        setCompetition(competition);
        setJeopardy(competition.jeopardy);
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load competition board");
      }
    }
    fetchData();
  }, [competitionId]);

  if (!competition || !jeopardy) return <p>Loading board...</p>;

  const categories = jeopardy.categories || [];
  const maxQuestions = Math.max(...categories.map((c) => c.questions.length));

  const handleCellClick = async (questionId) => {
    try {
      await competitionApi.setCurrentQuestion(competitionId, questionId);
      navigate(`/competitions/${competitionId}/question/instructor`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to set current question");
    }
  };

  const isAnswered = (questionId) =>
    competition.answeredQuestions?.includes(questionId);

  if (showRanking) {
    return (
      <>
        <button onClick={() => setShowRanking(false)}>⬅ Back to Board</button>
        <RankingContent competitionId={competitionId} />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.board}>
        <h1 className={styles.title}>{jeopardy.title}</h1>
        {message && <p className={styles.message}>{message}</p>}

        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}
        >
          {/* Category headers */}
          {categories.map((cat) => (
            <div key={cat._id} className={styles.category}>
              {cat.name}
            </div>
          ))}

          {/* Questions */}
          {Array.from({ length: maxQuestions }).map((_, rowIndex) =>
            categories.map((cat) => {
              const question = cat.questions[rowIndex];
              if (!question) {
                return <div key={cat._id + "-" + rowIndex}></div>;
              }

              const answered = isAnswered(question._id);

              return (
                <button
                  key={cat._id + "-" + rowIndex}
                  className={`${styles.cell} ${
                    answered ? styles.answered : ""
                  }`}
                  onClick={() => !answered && handleCellClick(question._id)}
                  disabled={answered}
                >
                  {question.points}
                </button>
              );
            })
          )}
        </div>
      </main>
      <button className={styles.rankingBtn} onClick={() => setShowRanking(true)}>
        Show Rankings
      </button>
      <Footer />
    </>
  );
}
