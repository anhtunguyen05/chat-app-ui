"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { loginRequest, registerRequest, loginWithGoogleRequest } from "@/features/auth/authSlice";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Min 2 characters"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export function AuthForm({ type }: { type: "login" | "register" }) {
  const form = useForm<LoginData | RegisterData>({
    resolver: zodResolver(type === "login" ? loginSchema : registerSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(type === "register" && { name: "" }),
    },
  });

  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  async function onSubmit(values: any) {
    setLoading(true);
    setServerError("");
    try {
      if (type === "register") {
        dispatch(registerRequest(values as RegisterData));
        alert("Register success!");
      } else {
        dispatch(loginRequest(values as LoginData));
        alert("Login success!");
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Hàm xử lý login bằng Google
  async function handleGoogleLogin(credentialResponse: any) {
    try {
      dispatch(loginWithGoogleRequest({ token: credentialResponse.credential }));
      alert("Login with Google success!");
    } catch (error) {
      console.error("Google login error:", error);
    }
  }

  return (
    <div className="mx-auto w-[350px] rounded-lg border p-6 shadow-sm bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <h1 className="text-2xl font-bold text-center">
            {type === "login" ? "Login" : "Register"}
          </h1>

          {type === "register" && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && (
            <p className="text-red-500 text-sm text-center">{serverError}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : type === "login" ? "Login" : "Register"}
          </Button>

          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => console.log("Google Login Failed")}
          />

          <div className="text-center mt-2">
            {type === "login" ? (
              <span>
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  className="text-blue-500 underline"
                  onClick={() => router.push("/auth/register")}
                >
                  Đăng ký
                </button>
              </span>
            ) : (
              <span>
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  className="text-blue-500 underline"
                  onClick={() => router.push("/auth/login")}
                >
                  Đăng nhập
                </button>
              </span>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
