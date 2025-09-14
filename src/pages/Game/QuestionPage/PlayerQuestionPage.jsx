// src/pages/Competition/QuestionPage/PlayerQuestionPage.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as playerApi from "../../../utilities/player-competition-api";
import socket from "../../../utilities/socket";
import styles from "./QuestionPage.module.scss";
import MarkdownRenderer from "../../../components/MarkdownRenderer/MarkdownRenderer";
import BuzzButton from "../../../components/BuzzButton/BuzzButton";
import JeopardyTheme from "../../../assets/Jeopardy-Theme.mp3"


export default function PlayerQuestionPage() {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [teamAnswering, setTeamAnswering] = useState(null);
  const [message, setMessage] = useState("");
  const [joinedTeamId, setJoinedTeamId] = useState(null);
  const [buzzersEnabled, setBuzzersEnabled] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);
  



  // decode token
  const token = localStorage.getItem("playerToken");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;

  // derived state: my team
  const myTeam = useMemo(() => {
    if (!payload || !competition) return null;
    return competition.teams.find(t => t._id === payload.teamId) || null;
  }, [competition, payload]);

  // fetch competition from API
  const fetchCompetition = async () => {
    try {
      const res = await playerApi.getCompetition(competitionId);
      setCompetition(res.competition);
      setCurrentQuestion(res.currentQuestionDetails);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load competition.");
    }
  };

  useEffect(() => {
  const handleBuzzersToggled = ({ enabled }) => {
    setBuzzersEnabled(enabled);
  };

  socket.on("buzzers-toggled", handleBuzzersToggled);

  return () => {
    socket.off("buzzers-toggled", handleBuzzersToggled);
  };
}, []);


  useEffect(() => {
    fetchCompetition();
  }, [competitionId]);

  // socket: team assignment
  useEffect(() => {
    const handleTeamAssigned = ({ teamId }) => {
      setJoinedTeamId(teamId);
    };

    socket.on("team-assigned", handleTeamAssigned);
    return () => {
      socket.off("team-assigned", handleTeamAssigned);
    };
  }, []);

  // socket: competition updates
  useEffect(() => {
    const handleCompetitionUpdate = (data) => {
      setCompetition(data.competition);
      // keep teams in sync
      if (data.teams) {
        setCompetition((prev) => ({
          ...prev,
          teams: data.teams,
        }));
      }
      // also sync current question if provided
   if (data.currentQuestionDetails) {
     setCurrentQuestion(data.currentQuestionDetails);
  }
    };

    socket.on("competition-updated", handleCompetitionUpdate);
    return () => {
      socket.off("competition-updated", handleCompetitionUpdate);
    };
  }, []);

  useEffect(() => {
  const handleQuestionChosen = ({ question }) => {
    setCurrentQuestion(question);
    setTeamAnswering(null);  // reset buzz state
    setMessage("");
  };

  socket.on("question-chosen", ({ currentQuestionDetails }) => {
  setCurrentQuestion(currentQuestionDetails);
  setTeamAnswering(null);
  setMessage("");
});

  return () => {
    socket.off("question-chosen", handleQuestionChosen);
  };
}, []);


  // socket: buzz events
  useEffect(() => {
    const handleBuzzLocked = ({ teamId }) => {
      const team = competition?.teams.find(t => t._id === teamId);
      if (team) {
        setTeamAnswering(team);
        setMessage(`${team.name} is answering now!`);
      }
    };

    const handleBuzzReset = () => setTeamAnswering(null);

    socket.on("buzz-locked", handleBuzzLocked);
    socket.on("buzz-reset", handleBuzzReset);

    return () => {
      socket.off("buzz-locked", handleBuzzLocked);
      socket.off("buzz-reset", handleBuzzReset);
    };
  }, [competition]);

  // handle buzzing
  const handleBuzz = () => {
  if (!competition) return;

  // Use derived state instead of raw search
  if (!myTeam) return setMessage("⚠️ Cannot find your team.");

  socket.emit("buzz", { competitionId, teamId: myTeam._id });
};
 useEffect(() => {
  const handleGameFinished = () => {
    navigate(`/competitions/${competitionId}/rankings/player`);
  };
  socket.on("game-finished", handleGameFinished);
  return () => socket.off("game-finished", handleGameFinished);
}, [competitionId, navigate]);




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
        <h2>
          {currentQuestion.category.name} - {currentQuestion.points}
        </h2>
        <div className={styles.questionText}>
          <MarkdownRenderer content={currentQuestion.text} />
        </div>

        <div className={styles.buzzersContainer}>
          <BuzzButton
            team={myTeam}
            identifierType="colors"
            onBuzz={handleBuzz}
            disabled={!buzzersEnabled || !!teamAnswering}
          />
        </div>



        {teamAnswering && <p>Team answering: {teamAnswering.name}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <h3>Scores:</h3>
        <ul>
          {competition.teams.map(team => (
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
