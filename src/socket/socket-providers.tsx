"use client";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  addOrUpdateConversationRequest,
  addMessageRequest,
  setOnlineListRequest,
} from "@/features/chat/chatSlice";
import { getUserGroups } from "@/services/groupService";

export default function SocketProvider() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (user?.id) {
      socket.emit("join", { userId: user.id });
      socket.emit("userOnline", user?.id);
      console.log("✅ Joined room:", user.id);
    }

    const joinGroups = async () => {
      try {
        // 🔹 Gọi API lấy danh sách group user thuộc về
        const groups = await getUserGroups();
        // 🔹 Join tất cả group
        groups.forEach((group: any) => {
          socket.emit("joinGroup", group.id);
        });

        console.log(
          "✅ Joined groups:",
          groups.map((g: any) => g.id)
        );
      } catch (err) {
        console.error("❌ Failed to join groups:", err);
      }
    };

    joinGroups();

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
