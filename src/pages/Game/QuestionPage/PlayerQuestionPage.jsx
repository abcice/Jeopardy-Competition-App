// src/pages/Competition/QuestionPage/PlayerQuestionPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as playerApi from "../../../utilities/player-competition-api";
import socket from "../../../utilities/socket";
import styles from "./QuestionPage.module.scss";
import MarkdownRenderer from "../../../components/MarkdownRenderer/MarkdownRenderer";
import BuzzButton from "../../../components/BuzzButton/BuzzButton";

export default function PlayerQuestionPage() {
  const { competitionId } = useParams();
  const [competition, setCompetition] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [teamAnswering, setTeamAnswering] = useState(null);
  const [message, setMessage] = useState("");
  const [joinedTeamId, setJoinedTeamId] = useState(null);

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
    };

    socket.on("competition-updated", handleCompetitionUpdate);
    return () => {
      socket.off("competition-updated", handleCompetitionUpdate);
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


  // loading state
  if (!competition || !currentQuestion) return <p>Loading question...</p>;

  return (
    <>
      <Navbar />
      <main className={styles["question-page"]}>
        <h2>
          {currentQuestion.category.name} - {currentQuestion.points}
        </h2>
        <div className={styles.questionText}>
          <MarkdownRenderer content={currentQuestion.text} />
        </div>

        <BuzzButton
          team={myTeam}
          identifierType="colors"
          onBuzz={handleBuzz}
          disabled={!!teamAnswering}
        />

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
