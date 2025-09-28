export interface User {
  id: string;
  email: string;
  nickname: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
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
