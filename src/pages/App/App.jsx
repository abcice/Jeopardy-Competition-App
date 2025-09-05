import React, { useState } from "react";
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
import GamePage from "../Game/GamePage/GamePage";
import QuestionBoard from "../Game/QuestionBoard/QuestionBoard";
import QuestionPage from "../Game/QuestionPage/QuestionPage";
import RankingPage from "../Game/RankingPage/RankingPage";

export default function App() {
  const [user, setUser] = useState(getUser());

  return (
    <main className={styles.App}>
      {user ? (
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          {/* Jeopardy creation flow */}
          <Route path="/jeopardy/create" element={<CreateGame />} />
          <Route path="/jeopardy/:jeopardyId/create-question" element={<CreateQuestion />} />
          <Route path="/jeopardy/:jeopardyId/import-question" element={<ImportQuestion />} />
          <Route path="/jeopardy/edit" element={<EditJeopardy />} />
          <Route path="/jeopardy/edit/:jeopardyId" element={<EditCompetition />} />

          {/* Competition setup */}
          <Route path="/competition/start" element={<CreateCompetition />} />
          <Route path="/competition/:id/setup" element={<GamePage />} />

          {/* Competition gameplay */}
          <Route path="/competitions/:competitionId/board" element={<QuestionBoard />} />
          <Route path="/competitions/:competitionId/question" element={<QuestionPage />} />
          <Route path="/competitions/:competitionId/rankings" element={<RankingPage />} />



          


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <AuthPage setUser={setUser} />
      )}
    </main>
  );
}
