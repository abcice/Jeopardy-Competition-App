// src/pages/Competition/QuestionPage/QuestionPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as competitionApi from "../../../utilities/competition-api";
import socket from "../../../utilities/socket";
import styles from "./QuestionPage.module.scss";
import DailyDouble from "./DailyDouble/DailyDouble";
import RankingContent from "../RankingPage/RankingContent";
import MarkdownRenderer from "../../../components/MarkdownRenderer/MarkdownRenderer";
import BuzzButton from "../../../components/BuzzButton/BuzzButton";

export default function QuestionPage() {
  const { competitionId } = useParams();

  const [competition, setCompetition] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [teamAnswering, setTeamAnswering] = useState(null); // team that buzzed first
  const [showDailyDouble, setShowDailyDouble] = useState(false);
  const [dailyDoubleResolved, setDailyDoubleResolved] = useState(false);
  const [dailyDoubleBid, setDailyDoubleBid] = useState(null);
  const [answerShown, setAnswerShown] = useState(false);
  const [message, setMessage] = useState("");
  const [showRanking, setShowRanking] = useState(false);
  const [buzzersVisible, setBuzzersVisible] = useState(false);
  const [lastQuestionId, setLastQuestionId] = useState(null);
  const [readyToGoBack, setReadyToGoBack] = useState(false);


  const navigate = useNavigate();

  // Fetch competition + question once when page loads
const fetchCompetition = async () => {
  try {
    const res = await competitionApi.getById(competitionId);
    const newQuestion = res.currentQuestionDetails;

    setCompetition(res.competition);
    setCurrentQuestion(newQuestion);

    // Only reset if question changed
    if (newQuestion?._id !== lastQuestionId) {
      setDailyDoubleResolved(false);
      setDailyDoubleBid(null);
      setTeamAnswering(null);
      setAnswerShown(false);  // ✅ only reset for NEW question
      setLastQuestionId(newQuestion?._id || null);
    }

    return res.competition;
  } catch (err) {
    console.error(err);
    setMessage("❌ Failed to load competition or question.");
    return null;
  }
};
  const handleBuzz = (team) => {
    socket.emit("buzz", { competitionId, teamId: team._id });
  };
  useEffect(() => {
  socket.on("buzz-locked", ({ teamId }) => {
    const team = competition?.teams.find((t) => t._id === teamId);
    if (team) {
      setTeamAnswering(team);
      setMessage(`${team.name} buzzed first!`);
    }
  });

  socket.on("buzz-reset", () => {
    setTeamAnswering(null);
    setMessage("Buzzers reset — teams may buzz again!");
  });

  return () => {
    socket.off("buzz-locked");
    socket.off("buzz-reset");
  };
}, [competition]);

  useEffect(() => {
    fetchCompetition();
  }, [competitionId]);

  // Show Daily Double popup when conditions match
  useEffect(() => {
    if (
      currentQuestion?.dailyDouble &&
      teamAnswering &&
      !dailyDoubleResolved &&
      dailyDoubleBid === null
    ) {
      setShowDailyDouble(true);
    } else {
      setShowDailyDouble(false);
    }
  }, [currentQuestion, teamAnswering, dailyDoubleResolved, dailyDoubleBid]);

  // Instructor-only handlers
const handleCorrect = async () => {
  if (!teamAnswering) {
    setMessage("⚠️ No team selected to answer.");
    return;
  }
  try {
    await competitionApi.markCorrect(
      competitionId,
      teamAnswering._id,
      teamAnswering.bid || 0
    );

    // Show the answer immediately
    setAnswerShown(true);

    // Set Go Back button visible
    setReadyToGoBack(true);
    socket.emit("reset-buzz", { competitionId });


    // Optionally fetch competition **without overwriting currentQuestion**
    const updatedCompetition = await competitionApi.getById(competitionId);
    setCompetition(updatedCompetition.competition);

    // Check if all questions answered
    const totalQuestions = updatedCompetition.competition.jeopardy.categories.reduce(
      (acc, cat) => acc + cat.questions.length,
      0
    );
    if (updatedCompetition.competition.answeredQuestions.length === totalQuestions) {
      setShowRanking(true);
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
      await competitionApi.markWrong(
        competitionId,
        teamAnswering._id,
        teamAnswering.bid || 0
      );
      setTeamAnswering(null); // allow next buzz
      setMessage("Teams may buzz again.");
      await fetchCompetition();
      socket.emit("reset-buzz", { competitionId });

    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to mark wrong.");
    }
  };

const handleSkip = async () => {
  try {
    await competitionApi.skipQuestion(competitionId);

    // Show the answer immediately
    setAnswerShown(true);
    setTeamAnswering(null);
    socket.emit("reset-buzz", { competitionId });


    // Update competition (scores, answered questions) WITHOUT overwriting currentQuestion
    const updatedCompetition = await competitionApi.getById(competitionId);
    setCompetition(updatedCompetition.competition);

    // Check if all questions answered
    const totalQuestions = updatedCompetition.competition.jeopardy.categories.reduce(
      (acc, cat) => acc + cat.questions.length,
      0
    );
    if (updatedCompetition.competition.answeredQuestions.length === totalQuestions) {
      setShowRanking(true);
    }

    // Show Go Back button
    setReadyToGoBack(true);

  } catch (err) {
    console.error(err);
    setMessage("❌ Failed to skip question.");
  }
};
const isPlayer = !!localStorage.getItem('playerToken');

{!isPlayer && (
  <div className={styles.controls}>
    <button onClick={handleCorrect}>Correct</button>
    <button onClick={handleWrong}>Wrong</button>
    <button onClick={handleSkip}>Skip</button>
  </div>
)}


  // ✅ if game is over, show ranking instead of question UI
  if (showRanking) {
    return <RankingContent competitionId={competitionId} />;
  }
  if (!competition || !currentQuestion) return <p>Loading question...</p>;

  return (
    <>
      <Navbar />
      <main
        className={`${styles["question-page"]} ${
          showDailyDouble ? styles.dailyDoubleActive : ""
        }`}
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

        {buzzersVisible && (
          <div className={styles.buzzersContainer}>
            {competition.teams.map((team) => (
              <BuzzButton
                key={team._id}
                team={team}
                identifierType={competition.identifierType || "colors"}
                onBuzz={(team) => {
                  setTeamAnswering(team);
                  if (currentQuestion?.dailyDouble) {
                    setDailyDoubleResolved(false);
                    setDailyDoubleBid(null);
                  }
                }}
                disabled={!!teamAnswering && teamAnswering._id !== team._id}
              />
            ))}
          </div>
        )}

        {buzzersVisible &&
          (teamAnswering ? (
            <p className={styles.teamAnswering}>
              Team answering: {teamAnswering.name}
            </p>
          ) : (
            <p className={styles.waiting}>Waiting for a team to buzz...</p>
          ))}

        {message && <p className={styles.message}>{message}</p>}

        {/* Instructor-only controls */}
        <div className={styles.controls}>
          <button
            onClick={() => setBuzzersVisible(true)}
            disabled={buzzersVisible || readyToGoBack}
          >
            Start!
          </button>
          <button
            onClick={handleCorrect}
            disabled={!teamAnswering || answerShown || showDailyDouble || readyToGoBack}
          >
            Correct
          </button>
          <button
            onClick={handleWrong}
            disabled={!teamAnswering || showDailyDouble || readyToGoBack}
          >
            Wrong
          </button>
          <button
            onClick={handleSkip}
            disabled={answerShown || showDailyDouble || readyToGoBack}
          >
            Skip
          </button>
        </div>
{readyToGoBack && (
  <div className={styles.goBackContainer}>
    <button
      className={styles.goBackButton}
      onClick={() => navigate(`/competitions/${competitionId}/board`)}
    >
      ⬅ Go Back to Question Board
    </button>
  </div>
)}




        {showDailyDouble && teamAnswering && (
          <DailyDouble
            competitionId={competitionId}
            team={teamAnswering}
            question={currentQuestion}
            onSubmitBid={(bid) => {
              setDailyDoubleBid(bid);
              setTeamAnswering({ ...teamAnswering, bid }); // ✅ persist bid on team
              setDailyDoubleResolved(true);
              setShowDailyDouble(false);
            }}
            onCancel={() => {
              setDailyDoubleResolved(true);
              setShowDailyDouble(false);
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
