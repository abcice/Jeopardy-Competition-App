// ✅ src/utilities/socket.js
import { io } from "socket.io-client";
import dotenv from 'dotenv';

const socket = io(import.meta.env.VITE_API_URL || "/", {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
