import { io } from "socket.io-client";

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
socket.on("connect", () => {
  console.log("🟢 Connected to socket:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from socket");
});

socket.on("connect_error", (err) => {
  console.log("⚠️ Socket connect error:", err.message);
});
