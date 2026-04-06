import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

// Maintain a single, centralized connection instance
const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

// Ensures we log exactly once globally
socket.on("connect", () => {
  console.log(`Successfully connected to the Cosmos server -> Socket ID: ${socket.id}`);
});

export default socket;
