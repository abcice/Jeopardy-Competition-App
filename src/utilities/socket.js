// src/utilities/socket.js
import { io } from "socket.io-client";

// Use your backend base URL
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
  autoConnect: true,
});

export default socket;
