"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { finishLoading } from "./authSlice";
import { setUser } from "@/features/user/userSlice";
import { getCurrentUser } from "@/services/authService";
import { connectSocket } from "@/lib/socket";

export default function useInitAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getCurrentUser();
        dispatch(setUser(res));
        connectSocket(); 
      } catch (err) {
        // Nếu 401 → interceptor sẽ tự động thử refresh token
        // Nếu refresh fail → không làm gì (user chưa login)
        dispatch(finishLoading());
      }
    };

    init();
  }, [dispatch]);
}
