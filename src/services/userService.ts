import api from "@/lib/axios";
import { User } from "@/types/user";

export interface UpdateAvatarData {
  file: File;
}

export interface UpdateResponse {
  message: string;
  user: User;
}

export async function updateAvatar(
  data: UpdateAvatarData
): Promise<UpdateResponse> {
  const formData = new FormData();
  formData.append("file", data.file);
  const res = await api.put<UpdateResponse>("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
