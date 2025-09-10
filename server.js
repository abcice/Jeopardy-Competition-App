// server.js
import dotenv from 'dotenv';
dotenv.config();
import './config/database.js';
import app from './app-server.js';
import http from 'http';
import { Server } from 'socket.io';
import Competition from './models/Competition.js';


const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Attach socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // 🔒 restrict to your frontend URL later
    methods: ["GET", "POST"]
  }
});

// Track buzzers per competition
const buzzState = {}; // { competitionId: { locked: false, teamId: null } }
// Track teams per competition
const competitions = {}; 
// { competitionId: { teams: [ { _id, name, color, members: [playerId] } ] } }

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // --- join competition ---
  
socket.on("join-competition", async ({ competitionId, role, teamId }) => {
  console.log(`📢 join-competition: competitionId=${competitionId}, role=${role}, teamId=${teamId}`);

  socket.join(competitionId);

    console.log(`✅ Socket ${socket.id} joined room ${competitionId}`);

     // Load competition from DB if not already loaded
  if (!competitions[competitionId]) {
    const comp = await Competition.findById(competitionId).lean();
    competitions[competitionId] = {
      teams: comp.teams.map(t => ({ ...t, members: [] }))
    };
    console.log(`🆕 Competition ${competitionId} initialized with teams:`, competitions[competitionId].teams);
  }


    // Add player to team if provided
  if (role === "player" && teamId) {
    const team = competitions[competitionId].teams.find(t => t._id.toString() === teamId);
    if (team) {
      team.members = team.members || [];
      if (!team.members.includes(socket.id)) team.members.push(socket.id);
    }
  }

    // Broadcast updated competition state
    console.log("📤 Broadcasting competition update:", competitions[competitionId]);
    // Emit updated competition to everyone in the room
  io.to(competitionId).emit("competition-updated", {
    competitionId,
    teams: competitions[competitionId].teams,
    joinedBy: role
  });
});

  // --- buzz ---
 // server.js

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


  // --- disconnect ---
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});



server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
