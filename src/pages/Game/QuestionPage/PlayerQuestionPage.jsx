// src/pages/Competition/QuestionPage/PlayerQuestionPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as playerApi from "../../../utilities/player-competition-api";
import socket from "../../../../socket";
import styles from "./QuestionPage.module.scss";
import MarkdownRenderer from "../../../components/MarkdownRenderer/MarkdownRenderer";
import BuzzButton from "../../../components/BuzzButton/BuzzButton";

export default function PlayerQuestionPage() {
  const { competitionId } = useParams();
  const [competition, setCompetition] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [teamAnswering, setTeamAnswering] = useState(null);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    socket.on("buzz-locked", ({ teamId }) => {
      const team = competition?.teams.find(t => t._id === teamId);
      if (team) {
        setTeamAnswering(team);
        setMessage(`${team.name} is answering now!`);
      }
    });
    socket.on("buzz-reset", () => setTeamAnswering(null));

    return () => {
      socket.off("buzz-locked");
      socket.off("buzz-reset");
    };
  }, [competition]);

  const handleBuzz = () => {
    const token = localStorage.getItem("playerToken");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const myTeam = competition.teams.find(t => t._id === payload.teamId);
    if (!myTeam) return setMessage("⚠️ Cannot find your team.");
    socket.emit("buzz", { competitionId, teamId: myTeam._id });
  };

  if (!competition || !currentQuestion) return <p>Loading question...</p>;

  return (
    <>
      <Navbar />
      <main className={styles["question-page"]}>
        <h2>{currentQuestion.category.name} - {currentQuestion.points}</h2>
        <div className={styles.questionText}>
          <MarkdownRenderer content={currentQuestion.text} />
        </div>

        <BuzzButton
          team={{ name: "Buzz!" }}
          onBuzz={handleBuzz}
          disabled={!!teamAnswering}
        />

        {teamAnswering && <p>Team answering: {teamAnswering.name}</p>}
        {message && <p className={styles.message}>{message}</p>}

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
