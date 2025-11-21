import api from "@/lib/axios";
import { User } from "@/types/user";
import { Member } from "@/types/group";
import { RelationshipStatus } from "@/types/friend";

export async function getUserGroups(): Promise<Object[]> {
  const res = await api.get<Object[]>(`/groups`); 
  return res.data;
}

export async function getGroupMembers(groupId: string): Promise<Member[]> {
  const res = await api.get<Member[]>(`conversations/group/${groupId}/members`); 
  return res.data;
}