import api from "@/lib/axios";

// Kiểu dữ liệu cho request/response (TypeScript)
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
  user: {
    id: string;
    name: string;
    email: string;
  };
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

// Lấy thông tin user hiện tại
export async function getProfile() {
  const res = await api.get("/auth/me");
  return res.data;
}
