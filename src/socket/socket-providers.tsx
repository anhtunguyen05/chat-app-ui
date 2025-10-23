"use client";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { addMessageRequest } from "@/features/chat/chatSlice";

export default function SocketProvider() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (user?.id) {
      socket.emit("join", { userId: user.id });
      console.log("✅ Joined room:", user.id);
    }

    // Lắng nghe tin nhắn đến
    socket.on("receiveMessage", (message) => {
      console.log("📥 Received:", message);
      dispatch(addMessageRequest(message));
    });

    // Tin nhắn gửi thành công
    socket.on("messageSent", (message) => {
      console.log("✅ Sent confirmed:", message);
      dispatch(addMessageRequest(message));
    });

    // Cleanup khi unmount
    return () => {
      socket.off("receiveMessage");
      socket.off("messageSent");
    };
  }, [user, dispatch]);

  return null;
}
