import api from "@/lib/axios";
import { socket } from "@/lib/socket";
import { User } from "@/types/user";
import { Conversation } from "@/features/chat/chatType";

export interface ConversationResponse {
  success: boolean;
  data: Conversation[];
}

export async function getConversations(): Promise<Object[]> {
  const res = await api.get<ConversationResponse>(`/conversations`);
  return res.data.data;
}

export async function getConversation(
  conversationId: string,
  page = 1,
  limit = 20
): Promise<Object[]> {
  const res = await api.get(`/chats/${conversationId}`, {
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
    conversationId: targetId,
    text,
    imageUrls,
    type: msgType,
  };

  socket.emit("sendMessage", payload);
}

export function markMessagesAsRead(
  userId: string,
  chatId: string,
  isGroup: boolean = false
) {
  socket.emit("markAsRead", {
    userId,
    chatId,
    isGroup,
  });
}

export function typing(senderId: string, conversationId: string) {
  socket.emit("typing", {
    senderId,
    conversationId,
  });
}

export function stopTyping(senderId: string, conversationId: string) {
  socket.emit("stopTyping", {
    senderId,
    conversationId,
  });
}

export async function fetchPendingMessages(): Promise<Object[]> {
  const res = await api.get("/chats/pending-messages");
  return res.data.messages;
}
