import React from "react";
import Image from "next/image";
import UserAvatar from "@/components/user-avatar/user-avatar";

interface ChatItemProps {
  avatarUrl: string;
  nickname: string;
  message?: string;
  time?: string;
  unread?: boolean;
  missedCall?: boolean;
  onClick?: () => void;
  active?: boolean;
}

const defaultAvatar = "/default-avatar.jpg";

export default function ChatItem({
  avatarUrl = defaultAvatar,
  nickname,
  message = "hiii",
  time = "10",
  unread = true,
  missedCall = false,
  onClick,
  active = false,
}: ChatItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 cursor-pointer  ${
        active ? "bg-blue-50" : "hover:bg-gray-100"
      } `}
      onClick={onClick}
    >
      <UserAvatar src={avatarUrl} size={56}></UserAvatar>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-medium truncate">{nickname}</p>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {time}
          </span>
        </div>
        <p
          className={`text-sm truncate ${
            missedCall ? "text-red-500 font-medium" : "text-gray-600"
          }`}
        >
          {message}
        </p>
      </div>
      {unread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
    </div>
  );
}
