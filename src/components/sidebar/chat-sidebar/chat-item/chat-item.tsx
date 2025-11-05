import React from "react";
import UserAvatar from "@/components/user-avatar/user-avatar";

interface ChatItemProps {
  avatarUrl?: string;
  nickname: string;
  message?: string;
  time?: string;
  unread?: boolean;
  missedCall?: boolean;
  onClick?: () => void;
  active?: boolean;
  isGroup?: boolean;
  lastSenderName?: string;
  isCurrentUserSender?: boolean;
}

const defaultAvatar = "/default-avatar.jpg";

export default function ChatItem({
  avatarUrl = defaultAvatar,
  nickname,
  message,
  time,
  unread = false,
  missedCall = false,
  onClick,
  active = false,
  isGroup = false,
  lastSenderName,
  isCurrentUserSender = false,
}: ChatItemProps) {
  // ✅ Hiển thị nội dung tin nhắn
  let displayMessage = "";

  if (!message) {
    displayMessage = "Chưa có tin nhắn";
  } else if (isGroup) {
    displayMessage = `${lastSenderName || "Ai đó"}: ${message}`;
  } else if (isCurrentUserSender) {
    displayMessage = `Bạn: ${message}`;
  } else {
    displayMessage = message;
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
        active ? "bg-blue-50" : "hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <UserAvatar src={avatarUrl} size={56} />

      <div className="flex-1 min-w-0">
        {/* Tên + thời gian */}
        <div className="flex justify-between items-center">
          <p className="font-medium truncate">{nickname}</p>
          {time && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {time}
            </span>
          )}
        </div>

        {/* Tin nhắn cuối */}
        <p
          className={`text-sm truncate ${
            missedCall ? "text-red-500 font-medium" : "text-gray-600"
          }`}
        >
          {displayMessage}
        </p>
      </div>

      {unread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
    </div>
  );
}
