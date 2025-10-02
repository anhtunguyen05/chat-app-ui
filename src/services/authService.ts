import api from "@/lib/axios";

// Kiểu dữ liệu cho request/response (TypeScript)

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Đăng nhập
export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
}

// Đăng ký
export async function register(data: RegisterData): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
}

// Đăng nhập bằng Google
export async function loginWithGoogle(token: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/google", { token });
  return res.data;
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<User>("/users"); // không cần id, server sẽ dựa vào token
  return res.data;
}

export async function logout() {
  await api.post("/auth/logout");
}

// Lấy thông tin user hiện tại
// export async function getProfile() {
//   const res = await api.get("/users/me");
//   return res.data;
// }
