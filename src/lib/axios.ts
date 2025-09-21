// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Gửi cookie nếu backend dùng session
  timeout: 10000, // 10 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor: tự động gắn token vào header (nếu có)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor: xử lý lỗi trả về
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ví dụ: token hết hạn → logout hoặc refresh
      console.warn("Unauthorized, maybe redirect to login...");
    }
    return Promise.reject(error);
  }
);

export default api;
