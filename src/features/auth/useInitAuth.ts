"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setCredentials, finishLoading } from "./authSlice";
import { getCurrentUser } from "@/services/authService";


export default function useInitAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
  const init = async () => {
    try {
      const res = await getCurrentUser();
      dispatch(setCredentials({ user: res }));
    } catch (err) {
      console.error("Init auth failed:", err);
      dispatch(finishLoading());
    }
  };

  init(); 
}, [dispatch]);

}
