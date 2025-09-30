import React from "react";
import Image from "next/image";

interface ChatItemProps {
  avatar: string;
  name: string;
  message: string;
  time: string;
  unread?: boolean;
  missedCall?: boolean;
}
export default function ChatItem({
  avatar,
  name,
  message,
  time,
  unread,
  missedCall,
}: ChatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer">
      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
        <Image src={avatar} alt={name} layout="fill" objectFit="cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-medium truncate">{name}</p>
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
