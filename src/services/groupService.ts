import api from "@/lib/axios";
import { User } from "@/types/user";
import { RelationshipStatus } from "@/types/friend";

export async function getUserGroups(): Promise<Object[]> {
  const res = await api.get<Object[]>(`/groups`); 
  return res.data;
}
