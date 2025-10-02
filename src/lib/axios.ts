// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // 🔑 để browser tự gửi cookie refreshToken
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor chỉ xử lý khi accessToken hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        // gọi refresh token API
        await api.post("/auth/refresh-token");

        // retry lại request gốc
        return api(original);
      } catch (err) {
        // refresh fail → clear session & logout
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
