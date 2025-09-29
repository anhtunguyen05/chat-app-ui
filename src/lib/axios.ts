// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // 🔑 bắt buộc để gửi kèm cookie
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ❌ KHÔNG cần interceptor gắn token nữa
// Cookie httpOnly đã được trình duyệt tự gửi

// ✅ Xử lý lỗi trả về
api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await api.post("/auth/refresh-token");     // server set lại accessToken
        return api(original);                // retry request gốc
      } catch {
        // Refresh cũng fail => logout
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);


export default api;
