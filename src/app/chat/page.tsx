"use client";

import React from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import Chat from "@/components/chat/chat";

export default function ChatsPage() {

  return (
    <div className="h-screen flex flex-col overscroll-none">
      <Header />
      <div className="flex flex-1 overflow-hidden overscroll-none">
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
} 
