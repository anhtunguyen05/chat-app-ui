"use client";

import React from "react";
import Image from "next/image";
import { socket } from "@/lib/socket";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchMessagesRequest,
  addMessage,
  addMessageRequest,
} from "@/features/chat/chatSlice";
import UserAvatar from "@/components/user-avatar/user-avatar";

export default function Info() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.user.user?.id);
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);
  const chatMessages = useAppSelector((state) => state.chat.messages) || [];

  const [isTyping, setIsTyping] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const avatarUrl = selectedUser?.avatarUrl || undefined;
  const nickname = selectedUser?.nickname || "Người dùng";

  React.useEffect(() => {
    if (selectedUser?.id) {
      dispatch(fetchMessagesRequest(selectedUser.id));
    }
  }, [dispatch, selectedUser]);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  React.useEffect(() => {
    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUser?.id) setIsTyping(true);
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === selectedUser?.id) setIsTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [selectedUser]);

  const isOnlyEmoji = (text: any) => {
    return /^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(
      text
    );
  };

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-3 bg-transparent"
      ref={containerRef}
    >
      {chatMessages.length === 0 && (
        <div className="text-center text-gray-400 text-sm mt-4">
          Chưa có tin nhắn nào
        </div>
      )}

      {chatMessages.map((msg: any) => {
        const isMine = msg.sender?.id === currentUserId;
        const hasText = msg.text && msg.text.trim() !== "";
        const hasImages = msg.imageUrls && msg.imageUrls.length > 0;

        return (
          <div
            key={msg._id}
            className={`flex items-end gap-2 ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar của người khác */}
            {!isMine && <UserAvatar src={avatarUrl} size={28} />}

            {/* Bọc toàn bộ tin nhắn (ảnh + text) vào 1 bubble */}
            <div
              className={`max-w-[70%] rounded-2xl overflow-hidden ${
                isMine
                  ? "bg-violet-600 text-white rounded-br-none"
                  : "bg-gray-200 text-black rounded-bl-none"
              }`}
            >
              {/* ẢNH */}
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

              {/* TEXT */}
              {hasText && (
                <div
                  className={`px-3 py-2 ${
                    hasImages ? "border-t border-white/20" : ""
                  }`}
                >
                  {isOnlyEmoji(msg.text) ? (
                    <span className="text-3xl">{msg.text}</span>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex items-end gap-2 justify-start">
          <UserAvatar src={avatarUrl} size={28} />
          <div className="flex items-center px-3 py-2 bg-gray-200 rounded-2xl">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
