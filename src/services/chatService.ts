import api from "@/lib/axios";
import { socket } from "@/lib/socket";
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
  senderId: string,
  receiverId: string,
  text: string,
  imageUrls: string[],
  type: string = "text"
): void {
  const message = {
    senderId: senderId,
    receiverId: receiverId,
    text: text,
    imageUrls: imageUrls,
    type: type,
  };
  console.log("📤 Sending message:", message);
  socket.emit("sendMessage", message);
}

export function typing(senderId: string, receiverId: string): void {
  socket.emit("typing", { senderId, receiverId });
}

export function stopTyping(senderId: string, receiverId: string): void {
  socket.emit("stopTyping", { senderId, receiverId });
}
