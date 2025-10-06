import { User } from "@/types/user";

export interface UpdateAvatarPayload {
  file: File;
}

export interface UpdateNicknamePayload{
  nickname: string,
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}
