import api from "@/lib/axios";
import { socket } from "@/lib/socket";
import { User } from "@/types/user";
import { Conversation } from "@/features/chat/chatType";
import { MessageSocketEvent, ConversationSocketEvent, MessageType } from "@/constants/socket-events";

export interface ConversationResponse {
  success: boolean;
  data: Conversation[];
}

export async function getConversations(): Promise<Object[]> {
  const res = await api.get<ConversationResponse>(`/conversations`);
  return res.data.data;
}

export async function getConversationParticipants(
  conversationId: string
): Promise<Object[]> {
  const res = await api.get(`/conversations/${conversationId}/participants`);
  return res.data;
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
  msgType: MessageType = MessageType.TEXT
): void {
  const payload: any = {
    senderId,
    conversationId: targetId,
    text,
    imageUrls,
    type: msgType,
  };

  socket.emit(MessageSocketEvent.SEND_MESSAGE, payload);
}

export function markMessagesAsRead(userId: string, conversationId: string) {
  socket.emit(MessageSocketEvent.MARK_AS_READ, {
    userId,
    conversationId,
  });
  console.log("✅ Marked as read:", conversationId);
}

export function typing(senderId: string, conversationId: string) {
  socket.emit(ConversationSocketEvent.TYPING, {
    senderId,
    conversationId,
  });
}

export function stopTyping(senderId: string, conversationId: string) {
  socket.emit(ConversationSocketEvent.STOP_TYPING, {
    senderId,
    conversationId,
  });
}

export async function fetchPendingMessages(): Promise<Object[]> {
  const res = await api.get("/chats/pending-messages");
  return res.data.messages;
}
