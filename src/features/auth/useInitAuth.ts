"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {  finishLoading } from "./authSlice";
import { setUser } from "@/features/user/userSlice";
import { getCurrentUser } from "@/services/authService";

export default function useInitAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getCurrentUser();
        dispatch(setUser(res));
      } catch (err) {
        console.error("Init auth failed:", err);
        dispatch(finishLoading());
      }
    };

    init();
  }, [dispatch]);
}
