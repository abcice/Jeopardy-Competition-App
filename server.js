import dotenv from 'dotenv';
dotenv.config();
import './config/database.js';
import app from './app-server.js';
import http from 'http';
import { Server } from 'socket.io';
import initSocket from './socket.js'; // adjust path if needed

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize Socket.IO
initSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
