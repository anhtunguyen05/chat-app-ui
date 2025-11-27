"use client";

import { useState } from "react";
import HeaderChat from "@/components/chat/header-chat/header-chat";
import Info from "@/components/chat/info/container-chat";
import InputChat from "@/components/chat/input-chat/input-chat";
import NoChat from "@/components/chat/no-chat";
import Information from "@/components/chat/information/information";
import { useAppSelector } from "@/hooks/useAppSelector";

export default function Chat() {
  const selectedConversation = useAppSelector((state) => state.chat.selectedConversation);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  if (!selectedConversation) {
    return <NoChat />;
  }

  return (
    <div className="flex-1 bg-neutral-100 p-4 overscroll-none">
      <div className="flex w-full h-full gap-4 overscroll-none">
        {/* Main chat area */}
        <div className={`flex flex-col bg-white rounded-2xl overscroll-none transition-all duration-300 ${showInfoPanel ? 'flex-[2]' : 'flex-1'}`}>
          <HeaderChat
            selectedConversation={selectedConversation}
            onInfoClick={() => setShowInfoPanel(!showInfoPanel)}
          />
          <Info />
          <InputChat />
        </div>

        {/* Info panel */}
        {showInfoPanel && (
          <Information selectedConversation={selectedConversation} />
        )}
      </div>
    </div>
  );
}
