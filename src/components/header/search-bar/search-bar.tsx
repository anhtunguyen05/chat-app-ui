"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn helper (nếu không có có thể bỏ)

export default function SearchBar() {
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
          "flex items-center gap-2 bg-gray-800 text-gray-300 rounded-full transition-all duration-200 px-3 py-2",
          // mobile: khi open mở rộng, desktop luôn rộng
          open ? "w-64" : "w-10 justify-center md:w-64 md:justify-start"
        )}
      >
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex-shrink-0"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* input:
            - mobile: ẩn nếu chưa open
            - desktop(md+): luôn hiện
        */}
        <input
          autoFocus={open}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm"
          className={cn(
            "bg-transparent outline-none text-sm flex-1 placeholder-gray-400",
            "hidden md:block", // desktop luôn hiện
            open && "block md:block" // mobile hiện khi open
          )}
        />
      </div>

      {/* Gợi ý khi có query */}
      {(open || query) && query && (
        <div className="absolute mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 text-sm">
          <p className="text-gray-500 dark:text-gray-300">Gợi ý tìm kiếm:</p>
          <ul className="mt-1 space-y-1">
            {[1, 2, 3].map((i) => (
              <li
                key={i}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                {query} {i}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
