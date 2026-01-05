import { io } from "socket.io-client";
import { CommonSocketEvent } from "@/constants/socket-events";

// Tạo socket nhưng KHÔNG tự connect
export const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: false, 
});

// Hàm để FE gọi connect sau khi login xong
export function connectSocket() {
  if (!socket.connected) {
    console.log("🔌 Connecting socket...");
    socket.connect();
  }
}

// Log event
socket.on(CommonSocketEvent.CONNECTION, () => {
  console.log("🟢 Connected to socket:", socket.id);
});

socket.on(CommonSocketEvent.DISCONNECT, () => {
  console.log("🔴 Disconnected from socket");
});

socket.on(CommonSocketEvent.CONNECT_ERROR, (err) => {
  console.log("⚠️ Socket connect error:", err.message);
});
