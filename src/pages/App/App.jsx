import { useState } from "react";
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


export default function App() {
  // Instructor/admin user (token)
  const [user, setUser] = useState(getUser());

  // Player (playerToken)
  const [playerToken] = useState(localStorage.getItem("playerToken"));

  // Either one means we are authenticated
  const isAuthenticated = user || playerToken;

  return (
    <main className={styles.App}>
      {isAuthenticated ? (
        <Routes>
          {/* Instructor dashboard */}
          {user && <Route path="/" element={<Dashboard />} />}

          {/* Game flow (shared between instructor + players) */}
          <Route path="/competition/:id/setup" element={<InstructorGamePage />} />
          <Route path="/competition/:id/player/setup" element={<PlayerGamePage />} />

          <Route
            path="/competitions/:competitionId/board"
            element={<QuestionBoard />}
          />
          <Route
            path="/competitions/:competitionId/question/instructor"
            element={<InstructorQuestionPage />}
          />
          <Route
            path="/competitions/:competitionId/question/player"
            element={<PlayerQuestionPage />}
          />

          <Route
            path="/competitions/:competitionId/rankings"
            element={<RankingPage />}
          />

          {/* Jeopardy creation (only instructors) */}
          {user && (
            <>
              <Route path="/jeopardy/create" element={<CreateGame />} />
              <Route
                path="/jeopardy/:jeopardyId/create-question"
                element={<CreateQuestion />}
              />
              <Route
                path="/jeopardy/:jeopardyId/import-question"
                element={<ImportQuestion />}
              />
              <Route path="/jeopardy/edit" element={<EditJeopardy />} />
              <Route
                path="/jeopardy/edit/:jeopardyId"
                element={<EditCompetition />}
              />
              <Route path="/competition/start" element={<CreateCompetition />} />
            </>
          )}

          {/* Default fallback */}
          <Route
            path="*"
            element={
              user ? <Navigate to="/" /> : <Navigate to="/competition/:id/setup" />
            }
          />
        </Routes>
      ) : (
        <AuthPage setUser={setUser} />
      )}
    </main>
  );
}