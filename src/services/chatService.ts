import api from "@/lib/axios";
import { User } from "@/types/user";

export async function fetchChatHistory(withUserId: string): Promise<string[]> {
  const res = await api.get<string[]>(`/chats/history/${withUserId}`);
  return res.data;
}

export async function getConversation(userId: string): Promise<Object[]> {
  console.log("Fetching conversation for userId:", userId);
  const res = await api.get<Object[]>(`/chats/conversation/${userId}`);
  return res.data;
}
