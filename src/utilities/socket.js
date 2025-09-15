// ✅ src/utilities/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || 'https://jeopardy-competition-app.onrender.com/', {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
