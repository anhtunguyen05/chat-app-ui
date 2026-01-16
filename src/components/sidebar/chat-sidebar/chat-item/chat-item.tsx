import React from "react";
import { Conversation } from "@/features/chat/chatType";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { timeFormat } from "@/utils/formatter";

interface ChatItemProps {
  conversation: Conversation;
  onClick?: () => void;
  active?: boolean;
}

export default function ChatItem({ conversation, onClick, active = false }: ChatItemProps) {
  const {
    name,
    avatar,
    lastMessage,
    lastMessageAt,
    isLastMessageRead
  } = conversation;

  const displayMessage = lastMessage || "Chưa có tin nhắn";

  const unread = !isLastMessageRead;

  return (
    <div
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
        active ? "bg-bubble-active" : "hover:bg-bubble-hover"
      }`}
      onClick={onClick}
    >
      <UserAvatar src={avatar} size={56} />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-medium truncate">{name}</p>
          {lastMessageAt && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {timeFormat(lastMessageAt)}
            </span>
          )}
        </div>

        <p className="text-sm truncate text-text-chat-item">{displayMessage}</p>
      </div>

      {unread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
    </div>
  );
}