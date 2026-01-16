"use client";

import Image from "next/image";
import SearchBar from "@/components/header/search-bar/search-bar";
import Nav from "@/components/header/nav/nav";
import Interaction from "@/components/header/interaction/interaction";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full h-14 bg-default text-white flex items-center justify-between px-4 shadow-md shadow-[0_1px_2px_rgba(0,0,0,0.08)]
  dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center gap-2">
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
      <Nav />
      <Interaction />
    </header>
  );
}
