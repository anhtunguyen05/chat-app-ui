import api from "@/lib/axios";
import { Member } from "@/types/group";

export async function getUserGroups(): Promise<object[]> {
  const res = await api.get<object[]>(`/groups`); 
  return res.data;
}

export async function getGroupMembers(groupId: string): Promise<Member[]> {
  const res = await api.get<Member[]>(`conversations/group/${groupId}/members`); 
  return res.data;
}