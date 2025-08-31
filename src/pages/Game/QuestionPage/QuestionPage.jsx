import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as competitionApi from "../../../utilities/competition-api";
import styles from "./QuestionPage.module.scss";
import DailyDouble from "./DailyDouble/DailyDouble";
import RankingContent from "../RankingPage/RankingContent";
import MarkdownRenderer from "../../../components/MarkdownRenderer/MarkdownRenderer";


export default function QuestionPage() {
  const { competitionId } = useParams();

  const [competition, setCompetition] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [teamAnswering, setTeamAnswering] = useState(null); // team that buzzed first
  const [showDailyDouble, setShowDailyDouble] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);
  const [message, setMessage] = useState("");
  const [showRanking, setShowRanking] = useState(false);

  

  // Fetch competition data
  const fetchCompetition = async () => {
    try {
      const res = await competitionApi.getById(competitionId);
      setCompetition(res.competition);
      setCurrentQuestion(res.currentQuestionDetails);
      return res.competition; // ✅ return latest competition

    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load competition or question.");
      return null;

    }
  };

useEffect(() => {
  fetchCompetition();
  const interval = setInterval(fetchCompetition, 3000);
  return () => clearInterval(interval);
}, [competitionId]);

useEffect(() => {
  if (currentQuestion?.dailyDouble && teamAnswering) {
    setShowDailyDouble(true);
  } else {
    setShowDailyDouble(false);
  }
}, [currentQuestion, teamAnswering]);


  // Instructor-only handlers
  const handleCorrect = async () => {
    if (!teamAnswering) {
      setMessage("⚠️ No team selected to answer.");
      return;
    }
    try {
      await competitionApi.markCorrect(competitionId, teamAnswering._id, teamAnswering.bid || 0);
      setAnswerShown(true);
const updatedCompetition = await fetchCompetition();
if (updatedCompetition) {
  const totalQuestions = updatedCompetition.jeopardy.categories.reduce(
    (acc, cat) => acc + cat.questions.length,
    0
  );
  if (updatedCompetition.answeredQuestions.length === totalQuestions) {
    setShowRanking(true);
  }
    }
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
const updatedCompetition = await fetchCompetition();
if (updatedCompetition) {
  const totalQuestions = updatedCompetition.jeopardy.categories.reduce(
    (acc, cat) => acc + cat.questions.length,
    0
  );
  if (updatedCompetition.answeredQuestions.length === totalQuestions) {
    setShowRanking(true);
  }
}
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to skip question.");
    }
  };

  if (!competition || !currentQuestion) return <p>Loading question...</p>;
  // ✅ if game is over, show ranking instead of question UI
  if (showRanking) {
    return <RankingContent competitionId={competitionId} />;
  }

  return (
    <>
      <Navbar />
      <main 
        className={`${styles["question-page"]} ${showDailyDouble ? styles.dailyDoubleActive : ""}`}

      >
        <h2>
          {currentQuestion.category.name} - {currentQuestion.points}
        </h2>
        <div className={styles.questionText}>
         <MarkdownRenderer content={currentQuestion.text} />
        </div>


        {answerShown && (
          <div className={styles.answer}>
            <strong>Answer:</strong>
            <MarkdownRenderer content={currentQuestion.answer} />
          </div>
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
          <button onClick={handleCorrect} disabled={!teamAnswering || answerShown || showDailyDouble}>Correct</button>
          <button onClick={handleWrong} disabled={!teamAnswering || showDailyDouble}>Wrong</button>
          <button onClick={handleSkip} disabled={answerShown || showDailyDouble}>Skip</button>
        </div>

        {showDailyDouble && teamAnswering && (
        <DailyDouble
          competitionId={competitionId}
          team={teamAnswering}
          question={currentQuestion}
          onFinish={async () => {
            setShowDailyDouble(false);
            setAnswerShown(true);
            await fetchCompetition();
          }}
        />
      )}


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
