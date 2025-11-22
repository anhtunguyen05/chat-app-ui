"use client";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  addOrUpdateConversationRequest,
  addMessageRequest,
  setOnlineListRequest,
  addPendingMessageRequest
} from "@/features/chat/chatSlice";
import { fetchPendingMessages } from "@/services/chatService";

export default function SocketProvider() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (user?.id) {
      socket.emit("join", { userId: user.id });
      socket.emit("userOnline", user?.id);
      console.log("✅ Joined room:", user.id);
    }

    const fetchPending = async () => {
    const res = await fetchPendingMessages();
    res.forEach(msg => dispatch(addPendingMessageRequest(msg)));
  };

  fetchPending();

    // Lắng nghe tin nhắn đến
    socket.on("receiveMessage", (message) => {
      console.log("📥 Received:", message);
      dispatch(addMessageRequest(message));
      dispatch(
        addOrUpdateConversationRequest({
          message,
          currentUserId: user?.id || null,
        })
      );
    });

    // Tin nhắn gửi thành công
    socket.on("messageSent", (message) => {
      console.log("✅ Sent confirmed:", message);
      dispatch(addMessageRequest(message));
      dispatch(
        addOrUpdateConversationRequest({
          message,
          currentUserId: user?.id || null,
        })
      );
    });

    socket.on("onlineList", (list: string[]) => {
      console.log("📡 onlineList:", list);
      dispatch(setOnlineListRequest(list));
    });

    // Cleanup khi unmount
    return () => {
      socket.off("receiveMessage");
      socket.off("messageSent");
      socket.off("userStatus");
      socket.off("onlineList");
    };
  }, [user, dispatch]);

  return null;
}
