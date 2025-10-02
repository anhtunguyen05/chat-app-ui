export interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
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
