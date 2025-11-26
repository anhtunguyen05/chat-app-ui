import React from "react";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { Participant } from "@/features/chat/chatType";

interface TypingIndicatorProps {
  typingUsers: string[];
  participants: Participant[];
}

export default function TypingIndicator({
  typingUsers,
  participants,
}: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-end gap-2 justify-start">
      {/* Avatar của tối đa 2 người đang typing */}
      {typingUsers.slice(0, 2).map((userId) => {
        const typingParticipant = participants.find(
          (p) => p.userId === userId
        );

        return (
          <UserAvatar
            key={userId}
            src={typingParticipant?.avatarUrl || "/default-avatar.jpg"}
            size={28}
          />
        );
      })}

      {/* Dấu 3 chấm typing */}
      <div className="flex items-center px-3 py-2 bg-gray-200 rounded-2xl">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
}
