import React from "react";
import Image from "next/image";

interface ChatItemProps {
  avatarUrl: string;
  nickname: string;
  message?: string;
  time?: string;
  unread?: boolean;
  missedCall?: boolean;
  onClick?: () => void;
}

const defaultAvatar = "/default-avatar.jpg";

export default function ChatItem({
  avatarUrl = defaultAvatar,
  nickname,
  message = "hiii",
  time = "10",
  unread = true,
  missedCall = false,
  onClick
}: ChatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer" onClick={onClick}>
      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
        <Image src={avatarUrl} alt={nickname} layout="fill" objectFit="cover" />
      </div>
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
