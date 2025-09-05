// server.js
import dotenv from 'dotenv';
dotenv.config();
import './config/database.js';
import app from './app-server.js';
import http from 'http';
import { Server } from 'socket.io';

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

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // When a player joins
  socket.on("join-competition", ({ competitionId, teamId }) => {
    socket.join(competitionId);
    console.log(`Team ${teamId} joined competition ${competitionId}`);
    io.to(competitionId).emit("team-joined", { teamId });
  });

  // Handle buzzing
  socket.on("buzz", ({ competitionId, teamId }) => {
    if (!buzzState[competitionId]) {
      buzzState[competitionId] = { locked: false, teamId: null };
    }

    if (!buzzState[competitionId].locked) {
      buzzState[competitionId] = { locked: true, teamId };
      io.to(competitionId).emit("buzz-locked", { teamId });
    } else {
      socket.emit("buzz-rejected", { reason: "Already locked" });
    }
  });

  // Instructor resets buzzers
  socket.on("reset-buzz", ({ competitionId }) => {
    buzzState[competitionId] = { locked: false, teamId: null };
    io.to(competitionId).emit("buzz-reset");
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
