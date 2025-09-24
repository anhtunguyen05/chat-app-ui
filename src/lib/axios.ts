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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token trong cookie hết hạn → xử lý logout / refresh
      console.warn("⚠️ Unauthorized: token có thể đã hết hạn");
      // Ví dụ: window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
