// src/pages/Competition/QuestionBoard/QuestionBoard.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as competitionApi from "../../../utilities/competition-api";
import styles from "./QuestionBoard.module.css";
import RankingContent from "../RankingPage/RankingContent";


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
        const comp = await competitionApi.getById(competitionId);
        setCompetition(comp);

        const jeopardyRes = await fetch(`/api/jeopardies/${comp.jeopardyId}`);
        const jeopardyData = await jeopardyRes.json();
        setJeopardy(jeopardyData);
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
      navigate(`/competitions/${competitionId}/question`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to set current question");
    }
  };

  // Helper to check if question is already answered
  const isAnswered = (questionId) => {
    return competition.answeredQuestions?.includes(questionId);
  };
  
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
        <h1>{jeopardy.title} - Question Board</h1>
        {message && <p className={styles.message}>{message}</p>}

        <table className={styles.table}>
          <thead>
            <tr>
              {categories.map((cat) => (
                <th key={cat._id}>{cat.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxQuestions }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {categories.map((cat) => {
                  const question = cat.questions[rowIndex];
                  if (!question) {
                    return (
                      <td key={cat._id + "-" + rowIndex}>
                        <span className={styles.empty}></span>
                      </td>
                    );
                  }

                  const answered = isAnswered(question._id);

                  return (
                    <td key={cat._id + "-" + rowIndex}>
                      <button
                        className={`${styles.cell} ${
                          answered ? styles.answered : ""
                        }`}
                        onClick={() =>
                          !answered && handleCellClick(question._id)
                        }
                        disabled={answered}
                      >
                        {question.points}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <button onClick={() => setShowRanking(true)}>Show Rankings</button>
      <Footer />
    </>
  );
}
