import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Icon } from "@/components/icon/icon";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { Conversation } from "@/features/chat/chatType";
import { timeFormat } from "@/utils/formatter";

interface HeaderChatProps {
  selectedConversation: Conversation;
  onInfoClick: () => void;
}

export default function HeaderChat({ selectedConversation, onInfoClick }: HeaderChatProps) {
  const isOnline = useAppSelector((state) =>
    state.chat.onlineList.includes(selectedConversation.id)
  );

  const formatLastSeen = (time: any) => {
    if (!time) return "";
    const offTime = timeFormat(time);
    return `Hoạt động ${offTime}`;
  };

  return (
    <div className="flex w-full h-16 items-center justify-between px-4 py-2 rounded-t-lg shadow-sm bg-white dark:bg-neutral-900">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3">
        <UserAvatar src={selectedConversation?.avatar}></UserAvatar>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-xl md:text-xl text-neutral-900 dark:text-white">
            {selectedConversation.name}
          </span>
          <p className="text-sm text-gray-500">
            {isOnline && selectedConversation.type === "private"
              ? "Đang hoạt động"
              : formatLastSeen(selectedConversation.lastSeen)}
          </p>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-4">
        <Icon
          name="phone"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        ></Icon>
        <Icon
          name="video"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        ></Icon>
        <Icon
          name="info"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
          onClick={onInfoClick}
        ></Icon>
      </div>
    </div>
  );
}
