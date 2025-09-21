"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login, register } from "@/services/authService";
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
import {useRouter} from "next/navigation";

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

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  async function onSubmit(values: any) {
    setLoading(true);
    setServerError("");
    try {
      if (type === "register") {
        await register(values as RegisterData);
        alert("Register success!");
      } else {
        const res =  await login(values as LoginData);
        localStorage.setItem("token", res.token);
        alert("Login success!");
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Hàm xử lý login bằng Google
  function handleGoogleLogin() {
    window.location.href = "/api/auth/google"; // Đường dẫn này tuỳ backend bạn cấu hình
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

          <Button
            type="button"
            className="w-full bg-red-500 hover:bg-red-600 mt-2"
            onClick={handleGoogleLogin}
          >
            Login with Google
          </Button>
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
