"use client";

import HeaderChat from "@/components/chat/header-chat/header-chat";
import Info from "@/components/chat/info/info";
import InputChat from "@/components/chat/input-chat/input-chat";
import NoChat from "@/components/chat/no-chat";
import { useAppSelector } from "@/hooks/useAppSelector";

export default function Chat() {
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);

  if (!selectedUser) {
    return <NoChat />;
  }

  return (
    <div className="flex-1 bg-neutral-100 p-4 overscroll-none">
      <div className="flex flex-col w-full h-full bg-white rounded-2xl overscroll-none">
        <HeaderChat
          name={selectedUser.nickname}
          status="onl"
          avatarUrl={selectedUser.avatarUrl}
        />
        <Info />
        <InputChat />
      </div>
    </div>
  );
}
