import { User } from "@/types/user";

export interface AuthState {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginGooglePayload {
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}
