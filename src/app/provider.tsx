"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProvider,
} from "next-themes";
import { store } from "./store";
import InitAuth from "@/features/auth/initAuth";

export function Providers({ children }: { children: React.ReactNode }) {

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <InitAuth/>
          {children}
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}
