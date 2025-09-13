// server.js
import dotenv from 'dotenv';
dotenv.config();
import './config/database.js';
import app from './app-server.js';
import http from 'http';
import { Server } from 'socket.io';
import Competition from './models/Competition.js';
import { createPlayerToken } from "./config/playerToken.js"; 

 


const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Attach socket.io
export const io = new Server(server, {
  cors: {
    origin: "*", // 🔒 restrict to your frontend URL later
    methods: ["GET", "POST"]
  }
});

// Track buzzers per competition
const buzzState = {}; // { competitionId: { questionId: { locked: false, teamId: null } } }
// Track teams per competition
export const competitions = {}; 
// { competitionId: { teams: [ { _id, name, color, members: [playerId] } ], currentQuestion: questionId } }

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // --- join competition ---
  socket.on("join-competition", async ({ competitionId, role }) => {
    try {
      console.log(`📢 join-competition: competitionId=${competitionId}, role=${role}`);

      socket.join(competitionId);
      console.log(`✅ Socket ${socket.id} joined room ${competitionId}`);

      // Load competition from DB if not already loaded
      if (!competitions[competitionId]) {
        const comp = await Competition.findById(competitionId).lean();
        if (!comp) {
          socket.emit("join-rejected", { reason: "Competition not found" });
          return;
        }

        competitions[competitionId] = {
          teams: comp.teams.map(t => ({ ...t, members: [] })),
          currentQuestion: comp.currentQuestion || null
        };
        console.log(`🆕 Competition ${competitionId} initialized with teams:`, competitions[competitionId].teams);
      }

      // --- Auto assign player to next available team ---
      if (role === "player") {
        const team = competitions[competitionId].teams.find(t => !t.members || t.members.length === 0);

        if (team) {
          team.members = [socket.id];
          console.log(`Assigned player ${socket.id} to team ${team.name}`);
          const playerToken = createPlayerToken({
          teamId: team._id,
          competitionId
        });
          socket.emit("team-assigned", {
          teamId: team._id,
          playerToken,
        });
        } else {
          console.log(`❌ No available teams for player ${socket.id}`);
          socket.emit("join-rejected", { reason: "No available teams left" });
          return;
        }
      }

      // Emit current question if exists
      const currentQuestionId = competitions[competitionId].currentQuestion;
if (currentQuestionId) {
  const comp = await Competition.findById(competitionId).lean();
  const question = comp.jeopardy.categories
    .flatMap(c => c.questions)
    .find(q => q._id.toString() === currentQuestionId.toString());
  if (question) {
    io.to(competitionId).emit("question-chosen", { question });
  }
}

      // Broadcast updated competition state
      io.to(competitionId).emit("competition-updated", {
        competitionId,
        teams: competitions[competitionId].teams,
        joinedBy: role
      });
    } catch (err) {
      console.error("❌ Error in join-competition:", err);
      socket.emit("join-rejected", { reason: "Server error" });
    }
  });

  // --- toggle buzzers ---
socket.on("toggle-buzzers", ({ competitionId, enabled }) => {
  io.to(competitionId).emit("buzzers-toggled", { enabled });
  console.log(`🚦 Buzzers ${enabled ? "enabled" : "disabled"} for competition ${competitionId}`);
});


  // --- buzz ---
  socket.on("buzz", ({ competitionId, teamId }) => {
    const currentQuestionId = competitions[competitionId]?.currentQuestion || null;

    if (!currentQuestionId) {
      socket.emit("buzz-rejected", { reason: "No question active" });
      return;
    }

    if (!buzzState[competitionId]) buzzState[competitionId] = {};
    if (!buzzState[competitionId][currentQuestionId]) {
      buzzState[competitionId][currentQuestionId] = { locked: false, teamId: null };
    }

    const buzz = buzzState[competitionId][currentQuestionId];

    if (!buzz.locked) {
      buzz.locked = true;
      buzz.teamId = teamId;
      io.to(competitionId).emit("buzz-locked", { teamId });
      console.log(`🔒 Buzz locked by team ${teamId} for question ${currentQuestionId}`);
    } else {
      socket.emit("buzz-rejected", { reason: "Already locked" });
    }
  });

  socket.on("reset-buzz", ({ competitionId }) => {
    const currentQuestionId = competitions[competitionId]?.currentQuestion || null;
    if (currentQuestionId && buzzState[competitionId]?.[currentQuestionId]) {
      buzzState[competitionId][currentQuestionId] = { locked: false, teamId: null };
      io.to(competitionId).emit("buzz-reset");
      console.log(`🔄 Buzz reset for competition ${competitionId}, question ${currentQuestionId}`);
    }
  });

  //---Game Finished---//
  socket.on("game-finished", ({ competitionId }) => {
  io.to(competitionId).emit("game-finished");
  console.log(`🏁 Game finished for competition ${competitionId}`);
});

  // --- disconnect ---
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    // Optional: remove player from teams
    Object.values(competitions).forEach(comp => {
      comp.teams.forEach(team => {
        team.members = team.members?.filter(id => id !== socket.id);
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
