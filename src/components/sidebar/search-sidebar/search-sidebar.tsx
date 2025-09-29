"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn helper (nếu không có có thể bỏ)

export default function SearchSidebar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Nút + ô search */}
      <div
        className={cn(
          "flex items-center gap-2 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white rounded-full transition-all duration-200 px-3 py-2",

          "w-10 justify-center md:w-80 md:justify-start"
        )}
      >
        <button className="flex-shrink-0" aria-label="Open settings">
          <Search className="w-5 h-5" />
        </button>

        <input
          autoFocus={open}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm"
          className={cn(
            "bg-transparent outline-none text-sm flex-1 placeholder-gray-400",
            "hidden md:block",
            open && "block md:block"
          )}
        />
      </div>
    </div>
  );
}
