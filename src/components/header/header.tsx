"use client";

import Image from "next/image";
import SearchBar from "@/components/header/search-bar/search-bar";
import Interaction from "@/components/header/interaction/interaction";

export default function Header() {
  return (
    <header className="w-full h-16 bg-transparent text-white flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Image
          src="/logo.png"
          sizes="1000px"
          className="h-auto w-[35px] min-w-[35px] flex-shrink-0 cursor-pointer sm:w-[40px] rounded-full"
          alt="logo"
          width={0}
          height={0}
          priority
          quality={100}
        />

        <SearchBar />
      </div>
      <Interaction />
    </header>
  );
}
