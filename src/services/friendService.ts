import api from "@/lib/axios";
import { User } from "@/types/user";

interface FriendResponse {
  data: User[];
}

export async function getFriendList(): Promise<User[]> {
  const res = await api.get<FriendResponse>("/friends");
  return res.data.data;
}
