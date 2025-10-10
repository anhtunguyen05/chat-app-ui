import api from "@/lib/axios";
import { User } from "@/types/user";

interface FriendResponse {
  data: User[];
}

interface FriendActionResponse {
  message: string;
  user: User;
}

interface CancelResponse{
  message: string;
}

export async function getFriendList(): Promise<User[]> {
  const res = await api.get<FriendResponse>("/friends");
  return res.data.data;
}

export async function sendFriendRequest(toId: string): Promise<FriendActionResponse> {
  const res = await api.post<FriendActionResponse>(`/friends/request/${toId}`);
  return res.data;
}

export async function acceptFriendRequest(fromId: string): Promise<FriendActionResponse> {
  const res = await api.put<FriendActionResponse>(`/friends/accept/${fromId}`);
  return res.data;
}

export async function rejectFriendRequest(fromId: string): Promise<FriendActionResponse> {
  const res = await api.put<FriendActionResponse>(`/friends/reject/${fromId}`);
  return res.data;
}

export async function cancelFriendRequest(toId: string): Promise<CancelResponse> {
  const res = await api.delete<CancelResponse>(`/friends/cancel/${toId}`);
  return res.data;
}

export async function unfriend(userId: string): Promise<CancelResponse> {
  const res = await api.delete<CancelResponse>(`/friends/unfriend/${userId}`);
  return res.data;
}