"use client";
import useInitAuth from "@/features/auth/useInitAuth";

function InitAuth() {
  useInitAuth(); // hook này chỉ chạy khi app mount
  return null;   // không render gì
}

export default InitAuth;
