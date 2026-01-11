import React from "react";
import { isOnlyEmoji } from "@/lib/utils";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { Participant, Conversation, Message } from "@/features/chat/chatType";

interface MessageBubbleProps {
  msg: Message;
  isMine: boolean;
  selectedConversation: Conversation | null;
  chatMessages: Message[];
  seenBy: Participant[];
}

export default function MessageBubble({
  msg,
  isMine,
  selectedConversation,
  chatMessages,
  seenBy,
}: MessageBubbleProps) {
  const hasText = msg.text && msg.text.trim() !== "";
  const hasImages = msg.imageUrls && msg.imageUrls.length > 0;

  const showAvatar =
    !isMine &&
    (selectedConversation?.type === "group" || chatMessages.length > 1);

  return (
    <div
      className={`flex items-start gap-2 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar trái (chỉ hiện nếu là tin nhắn người khác) */}
      {showAvatar && (
        <UserAvatar
          src={
            selectedConversation?.type === "group"
              ? msg.sender?.avatarUrl || "/default-avatar.jpg"
              : selectedConversation?.avatar || "/default-avatar.jpg"
          }
          size={28}
          className="mt-3"
        />
      )}

      {/* Wrapper bong bóng + avatar đã đọc */}
      <div className="flex flex-col max-w-[70%]">
        {/* Bong bóng tin nhắn */}
        <div
          className={`rounded-2xl overflow-hidden ${
            isMine
              ? "bg-violet-600 text-white rounded-br-none"
              : "bg-gray-200 text-black rounded-bl-none"
          }`}
        >
          {/* Ảnh */}
          {hasImages && (
            <div
              className={`grid gap-1 ${
                msg.imageUrls.length === 1
                  ? "grid-cols-1"
                  : msg.imageUrls.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
              }`}
            >
              {msg.imageUrls.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  className="w-full max-h-56 object-cover"
                />
              ))}
            </div>
          )}

          {/* Text */}
          {hasText && (
            <div
              className={`px-3 py-2 ${
                hasImages ? "border-t border-black/10" : ""
              }`}
            >
              {msg.text && isOnlyEmoji(msg.text) ? (
                <span className="text-3xl leading-none">{msg.text}</span>
              ) : (
                <span>{msg.text}</span>
              )}
            </div>
          )}
        </div>

        {/* PRIVATE – avatar đã đọc */}
        {isMine &&
          seenBy.length > 0 &&
          selectedConversation?.type === "private" && (
            <div className="mt-1 self-end">
              <UserAvatar
                src={
                  seenBy[0]?.avatarUrl ||
                  selectedConversation.avatar ||
                  "/default-avatar.jpg"
                }
                size={18}
              />
            </div>
          )}

        {/* GROUP – nhiều avatar đã đọc */}
        {seenBy.length > 0 && selectedConversation?.type === "group" && (
          <div className="flex mt-1 -space-x-2 self-end">
            {seenBy.map((participant: Participant) => (
              <UserAvatar
                key={participant.id || participant.userId}
                src={participant.avatarUrl || "/default-avatar.jpg"}
                size={18}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
