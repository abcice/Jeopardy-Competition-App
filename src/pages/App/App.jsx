// src/pages/App/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import styles from "./App.module.scss";
import { getUser } from "../../utilities/users-service";

// Core pages
import AuthPage from "../AuthPage/AuthPage";
import Dashboard from "../Dashboard/Dashboard";

// Jeopardy creation/editing
import CreateGame from "../Create/CreateGame/CreateGame";
import CreateQuestion from "../Create/CreateQuestion/CreateQuestion";
import ImportQuestion from "../Create/ImportQuestion/ImportQuestion";
import EditJeopardy from "../Create/EditJeopardy/EditJeopardy";
import EditCompetition from "../Create/EditCompetition/EditCompetition";

// Competition setup & game flow
import CreateCompetition from "../Game/CreateCompetition/CreateCompetition";
import InstructorGamePage from "../Game/GamePage/InstructorGamePage";
import QuestionBoard from "../Game/QuestionBoard/QuestionBoard";
import InstructorQuestionPage from "../Game/QuestionPage/InstructorQuestionPage";
import PlayerQuestionPage from "../Game/QuestionPage/PlayerQuestionPage";
import RankingPage from "../Game/RankingPage/RankingPage";
import PlayerGamePage from "../Game/GamePage/PlayerGamePage";

function getValidPlayerToken() {
  const token = localStorage.getItem("playerToken");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.competitionId || payload.exp < Date.now() / 1000) {
      localStorage.removeItem("playerToken");
      return null;
    }
    return token;
  } catch (e) {
    localStorage.removeItem("playerToken");
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getUser());
  const [playerToken, setPlayerToken] = useState(getValidPlayerToken());

  const isAuthenticated = !!user || !!playerToken;

  // ✅ Debug console log
  console.log("App Render:", { user, playerToken, isAuthenticated });

  return (
    <main className={styles.App}>
      <Routes>
        {/* Authenticated routes */}
        {isAuthenticated && user && <Route path="/" element={<Dashboard />} />}
        {isAuthenticated && <Route path="/competition/:id/setup" element={<InstructorGamePage />} />}
        {isAuthenticated && <Route path="/competition/:id/player/setup" element={<PlayerGamePage playerToken={playerToken} />} />}
        {isAuthenticated && <Route path="/competitions/:competitionId/board" element={<QuestionBoard />} />}
        {isAuthenticated && <Route path="/competitions/:competitionId/question/instructor" element={<InstructorQuestionPage />} />}
        {isAuthenticated && <Route path="/competitions/:competitionId/question/player" element={<PlayerQuestionPage />} />}
        {isAuthenticated && <Route path="/competitions/:competitionId/rankings" element={<RankingPage />} />}

        {isAuthenticated && user && (
          <>
            <Route path="/jeopardy/create" element={<CreateGame />} />
            <Route path="/jeopardy/:jeopardyId/create-question" element={<CreateQuestion />} />
            <Route path="/jeopardy/:jeopardyId/import-question" element={<ImportQuestion />} />
            <Route path="/jeopardy/edit" element={<EditJeopardy />} />
            <Route path="/jeopardy/edit/:jeopardyId" element={<EditCompetition />} />
            <Route path="/competition/start" element={<CreateCompetition />} />
          </>
        )}

        {/* Auth page for unauthenticated users */}
        {!user && <Route path="/auth" element={<AuthPage setUser={setUser} setPlayerToken={setPlayerToken} />} />}

        {/* Fallback */}
        <Route path="*" element={!user ? <Navigate to="/auth" /> : <Navigate to="/" />} />
      </Routes>
    </main>
  );
}
