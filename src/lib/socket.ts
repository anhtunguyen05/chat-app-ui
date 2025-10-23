// src/lib/socket.ts
import { io } from "socket.io-client";

// ✅ Kết nối tới backend
export const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"], 
});

// Khi kết nối
socket.on("connect", () => {
  console.log("🟢 Connected to socket:", socket.id);
});

// Khi ngắt kết nối
socket.on("disconnect", () => {
  console.log("🔴 Disconnected from socket");
});