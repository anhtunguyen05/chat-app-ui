import api from "@/lib/axios";
import { User } from "@/types/user";

export interface UpdateImageData {
  file: File;
}

export interface UpdateNicknameData {
  nickname: string;
}

export interface UpdateResponse {
  message: string;
  user: User;
}

export async function updateAvatar(
  data: UpdateImageData
): Promise<UpdateResponse> {
  const formData = new FormData();
  formData.append("file", data.file);
  const res = await api.put<UpdateResponse>("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateCover(
  data: UpdateImageData
): Promise<UpdateResponse> {
  const formData = new FormData();
  formData.append("file", data.file);
  const res = await api.put<UpdateResponse>("/users/cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateNickname(
  data: UpdateNicknameData
): Promise<UpdateResponse> {
  const res = await api.put<UpdateResponse>("/users", data);
  return res.data;
}
