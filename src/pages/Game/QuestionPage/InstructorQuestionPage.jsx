// src/pages/Competition/QuestionPage/InstructorQuestionPage.jsx
import { useState, useEffect, useRef  } from "react";
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
import JeopardyTheme from "../../../assets/Jeopardy-Theme.mp3"
import CorrectSound from "../../../assets/correct.mp3"
import WrongSound from "../../../assets/wrong.mp3"

export default function InstructorQuestionPage() {
  const { competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [teamAnswering, setTeamAnswering] = useState(null);
  const [buzzersVisible, setBuzzersVisible] = useState(false);
  const [showDailyDouble, setShowDailyDouble] = useState(false);
  const [dailyDoubleResolved, setDailyDoubleResolved] = useState(false);
  const [dailyDoubleBid, setDailyDoubleBid] = useState(null);
  const [answerShown, setAnswerShown] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [lastQuestionId, setLastQuestionId] = useState(null);
  const [readyToGoBack, setReadyToGoBack] = useState(false);
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const correctAudio = new Audio(CorrectSound);
  const wrongAudio = new Audio(WrongSound);



  const fetchCompetition = async () => {
    try {
      const res = await competitionApi.getById(competitionId);
      const newQuestion = res.currentQuestionDetails;
      setCompetition(res.competition);
      setCurrentQuestion(newQuestion);

      if (newQuestion?._id !== lastQuestionId) {
        setTeamAnswering(null);
        setDailyDoubleResolved(false);
        setDailyDoubleBid(null);
        setAnswerShown(false);
        setLastQuestionId(newQuestion?._id || null);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load competition or question.");
    }
  };

  const handleBuzz = (team) => {
    socket.emit("buzz", { competitionId, teamId: team._id });
  };

  useEffect(() => {
  const handleQuestionChosen = ({ question }) => {
    setCurrentQuestion(question);
    setTeamAnswering(null);
    setDailyDoubleResolved(false);
    setDailyDoubleBid(null);
    setAnswerShown(false);
  };

  socket.on("question-chosen", ({ currentQuestionDetails }) => {
  setCurrentQuestion(currentQuestionDetails);
  setTeamAnswering(null);
  setMessage("");
  setBuzzersVisible(false); // 👈 reset on new question
  socket.emit("toggle-buzzers", { competitionId, enabled: false });
});


  return () => {
    socket.off("question-chosen", handleQuestionChosen);
  };
}, []);


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
  async function fetchData() {
    try {
      await fetchCompetition();
    } catch (err) {
      console.error(err);
    }
  }
  fetchData();
}, [competitionId]);


  useEffect(() => {
  if (
    currentQuestion?.dailyDouble &&
    teamAnswering &&
    !dailyDoubleResolved &&
    dailyDoubleBid === null
  ) {
    setShowDailyDouble(true);
  }
}, [currentQuestion, teamAnswering, dailyDoubleResolved, dailyDoubleBid]);


  // Instructor actions
  const handleCorrect = async () => {
    if (!teamAnswering) return setMessage("⚠️ No team selected to answer.");
    try {
      correctAudio.currentTime = 0; 
     correctAudio.play();
      const bidToSend = currentQuestion.dailyDouble
  ? dailyDoubleBid || teamAnswering.bid || 0
  : 0;

await competitionApi.markCorrect(competitionId, teamAnswering._id, bidToSend);

      
      setAnswerShown(true);
      setReadyToGoBack(true);
      socket.emit("reset-buzz", { competitionId });
      const updatedCompetition = await competitionApi.getById(competitionId);
      setCompetition(updatedCompetition.competition);

      const totalQuestions = updatedCompetition.competition.jeopardy.categories.reduce(
        (acc, cat) => acc + cat.questions.length,
        0
      );
      if (updatedCompetition.competition.answeredQuestions.length === totalQuestions) {
        setShowRanking(true);
        socket.emit("game-finished", { competitionId }); // 👈 notify players
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to mark correct.");
    }
  };

  const handleWrong = async () => {
  if (!teamAnswering) return setMessage("⚠️ No team selected to answer.");

  try {
    wrongAudio.currentTime = 0;
    wrongAudio.play();
    const isDailyDouble = currentQuestion?.dailyDouble;
    const bidToSend = isDailyDouble && typeof teamAnswering.bid === 'number' ? teamAnswering.bid : undefined;

    await competitionApi.markWrong(competitionId, teamAnswering._id, bidToSend);

    setTeamAnswering(null);
    setMessage("Teams may buzz again.");
    await fetchCompetition();
    socket.emit("reset-buzz", { competitionId });
    if (isDailyDouble) {
      setDailyDoubleResolved(true);
    }
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
      socket.emit("reset-buzz", { competitionId });

      const updatedCompetition = await competitionApi.getById(competitionId);
      setCompetition(updatedCompetition.competition);

      const totalQuestions = updatedCompetition.competition.jeopardy.categories.reduce(
        (acc, cat) => acc + cat.questions.length,
        0
      );
      if (updatedCompetition.competition.answeredQuestions.length === totalQuestions) {
        setShowRanking(true);
      }

      setReadyToGoBack(true);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to skip question.");
    }
  };

  if (showRanking) return <RankingContent competitionId={competitionId} />;
  if (!competition || !currentQuestion) return <p>Loading question...</p>;

  return (
    <>
      <Navbar />
      <audio ref={audioRef} src={JeopardyTheme} loop autoPlay />
      <div className={styles.muteButtonContainer}>
        <button
          className={styles.muteButton}
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = !audioRef.current.muted;
              setIsMuted(audioRef.current.muted);
            }
          }}
        >
          {isMuted ? "Unmute 🎵" : "Mute 🔇"}
        </button>
      </div>

      <main className={styles["question-page"]}>
        <h2>{currentQuestion.category.name} - {currentQuestion.points}</h2>
        <div className={styles.questionText}>
          <MarkdownRenderer content={currentQuestion.text} />
        </div>

        {answerShown && (
          <div className={styles.answer}>
            <strong>Answer:</strong>
            <MarkdownRenderer content={currentQuestion.answer} />
          </div>
        )}

        {/* Buzzers */}
        {buzzersVisible && (
          <div className={styles.buzzersContainer}>
            {competition.teams.map(team => (
              <BuzzButton
                key={team._id}
                team={team}
                identifierType={competition.identifierType || "colors"}
                onBuzz={() => handleBuzz(team)}
                disabled={!!teamAnswering && teamAnswering._id !== team._id}
              />
            ))}
          </div>
        )}

        {teamAnswering ? (
          <p className={styles.teamAnswering}>Team answering: {teamAnswering.name}</p>
        ) : (
          <p className={styles.waiting}>Waiting for a team to buzz...</p>
        )}

        {message && <p className={styles.message}>{message}</p>}

        {/* Instructor controls */}
        <div className={styles.controls}>
          <button 
    onClick={() => {
      setBuzzersVisible(true);
      socket.emit("toggle-buzzers", { competitionId, enabled: true });
    }}
    disabled={buzzersVisible || readyToGoBack}
  >
    Start!
  </button>

          <button onClick={handleCorrect} disabled={!teamAnswering || answerShown || showDailyDouble || readyToGoBack}>Correct</button>
          <button onClick={handleWrong} disabled={!teamAnswering || showDailyDouble || readyToGoBack}>Wrong</button>
          <button onClick={handleSkip} disabled={answerShown || showDailyDouble || readyToGoBack}>Skip</button>
        </div>

        {readyToGoBack && (
          <div className={styles.goBackContainer}>
            <button className={styles.goBackButton} onClick={() => navigate(`/competitions/${competitionId}/board`)}>
              ⬅ Go Back to Question Board
            </button>
          </div>
        )}

        {/* Daily Double */}
        {showDailyDouble && teamAnswering && (
          <DailyDouble
            competitionId={competitionId}
            team={teamAnswering}
            question={currentQuestion}
            onSubmitBid={(bid) => {
              setDailyDoubleBid(bid);
              setTeamAnswering({ ...teamAnswering, bid });
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
          {competition.teams.map(team => (
            <li key={team._id}>{team.name}: {team.score}</li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}