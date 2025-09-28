"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon/icon";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 🟢 Tránh lỗi mismatch giữa server và client
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full h-full flex transition"
    >
      {theme === "dark" ? (
        <span className="flex items-center gap-2">
          <Icon name="sun" className="text-yellow-500" buttonClassName="w-8 h-8"/>
          Chế độ tối
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Icon name="moon" className="text-gray-600" buttonClassName="w-8 h-8"/>
          Chế độ sáng
        </span>
      )}
    </button>
  );
}
