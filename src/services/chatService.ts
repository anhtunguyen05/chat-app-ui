import api from "@/lib/axios";
import { socket } from "@/lib/socket";
import { User } from "@/types/user";

export async function getConversations(): Promise<Object[]> {
  const res = await api.get<Object[]>(`/chats`);
  return res.data;
}

export async function getConversation(
  type: "private" | "group",
  targetId: string,
  page = 1,
  limit = 20
): Promise<Object[]> {
  const res = await api.get(`/chats/${type}/${targetId}`, {
    params: { page, limit },
  });
  return res.data;
}

export async function uploadImages(images: File[]): Promise<string[]> {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append("images", image);
  });
  const res = await api.post<string[]>("/chats/upload-images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export function sendMessage(
  type: "private" | "group",
  senderId: string,
  targetId: string,
  text: string,
  imageUrls: string[] = [],
  msgType: "text" | "image" | "mixed" = "text"
): void {
  const payload: any = {
    senderId,
    text,
    imageUrls,
    type: msgType,
  };

  if (type === "group") {
    payload.groupId = targetId;
    console.log("📤 Sending group message:", payload);
    socket.emit("sendGroupMessage", payload);
  } else {
    payload.receiverId = targetId;
    console.log("📤 Sending private message:", payload);
    socket.emit("sendMessage", payload);
  }
}

export function markMessagesAsRead(
  userId: string,
  chatId: string,
  isGroup: boolean = false
) {
  socket.emit("markAsRead", { 
    userId,
    chatId,
    isGroup
  });
}

export function typing(
  senderId: string,
  targetId: string,
  isGroup: boolean = false
) {
  socket.emit("typing", {
    senderId,
    receiverId: isGroup ? null : targetId,
    groupId: isGroup ? targetId : null,
  });
}

export function stopTyping(
  senderId: string,
  targetId: string,
  isGroup: boolean = false
) {
  socket.emit("stopTyping", {
    senderId,
    receiverId: isGroup ? null : targetId,
    groupId: isGroup ? targetId : null,
  });
}
