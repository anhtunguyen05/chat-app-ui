"use client";

import React from "react";
import Image from "next/image";
import { socket } from "@/lib/socket";
import { isOnlyEmoji } from "@/lib/utils";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchMessagesRequest } from "@/features/chat/chatSlice";
import UserAvatar from "@/components/user-avatar/user-avatar";
import ChatScrollHandler from "@/components/chat/chat-scroll-handler/chat-scroll-handler";
import { Member } from "@/types/group";
import { getGroupMembers } from "@/services/groupService";

export default function Info() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.user.user?.id);
  const { selectedConversation, hasMore, page } = useAppSelector(
    (state) => state.chat
  );
  const chatMessages = useAppSelector((state) => state.chat.messages) || [];

  const [isTyping, setIsTyping] = React.useState(false);
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const avatarUrl = selectedConversation?.target.avatarUrl || undefined;
  const nickname = selectedConversation?.target.nickname || "Người dùng";

  const fetchMembers = async (groupId: string) => {
    try {
      const res = await getGroupMembers(groupId);
      setMembers(res);
    } catch (err) {
      console.error("❌ Failed to fetch members:", err);
    }
  };

  React.useEffect(() => {
    if (!selectedConversation) return;

    dispatch(
      fetchMessagesRequest({
        type: selectedConversation.type,
        targetId: selectedConversation.id,
        page: 1,
      })
    );

    if (selectedConversation.type === "group") {
      fetchMembers(selectedConversation.id);
    }
  }, [dispatch, selectedConversation]);

  React.useEffect(() => {
    if (!selectedConversation) return;

    const handleTyping = ({
      senderId,
      groupId,
    }: {
      senderId: string;
      groupId?: string;
    }) => {
      const isGroup = selectedConversation.type === "group";

      // 🔹 Nếu là group → chỉ hiển thị typing trong group đúng ID
      // 🔹 Nếu là private → kiểm tra người gửi có đúng user đang chat
      if (
        (isGroup &&
          groupId === selectedConversation.id &&
          senderId !== currentUserId) ||
        (!isGroup && senderId === selectedConversation.id)
      ) {
        setIsTyping(true);
      }

      setTypingUsers((prev) =>
        prev.includes(senderId) ? prev : [...prev, senderId]
      );
    };

    const handleStopTyping = ({
      senderId,
      groupId,
    }: {
      senderId: string;
      groupId?: string;
    }) => {
      const isGroup = selectedConversation.type === "group";

      if (
        (isGroup && groupId === selectedConversation.id) ||
        (!isGroup && senderId === selectedConversation.id)
      ) {
        setIsTyping(false);
      }
      setTypingUsers((prev) => prev.filter((id) => id !== senderId));
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [selectedConversation]);

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-3 bg-transparent "
      ref={containerRef}
    >
      <div className="flex flex-col justify-end min-h-full space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-4">
            Chưa có tin nhắn nào
          </div>
        )}
  
        {chatMessages.map((msg: any) => {
          const isMine = msg.sender?.id === currentUserId;
          const hasText = msg.text && msg.text.trim() !== "";
          const hasImages = msg.imageUrls && msg.imageUrls.length > 0;
  
          // 🔹 Nếu là group → hiển thị avatar của người gửi
          const showAvatar =
            !isMine &&
            (selectedConversation?.type === "group" || chatMessages.length > 1);
  
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              {/* 🔹 Avatar */}
              {showAvatar && (
                <UserAvatar
                  src={
                    selectedConversation?.type === "group"
                      ? msg.sender?.avatarUrl || "/default-avatar.jpg"
                      : selectedConversation?.target?.avatarUrl ||
                        "/default-avatar.jpg"
                  }
                  size={28}
                />
              )}
  
              {/* 🔹 Nội dung tin nhắn */}
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
  
        {typingUsers.length > 0 && (
          <div className="flex items-end gap-2 justify-start">
            {typingUsers.slice(0, 2).map((id) => {
              const member = members.find((m: Member) => m.id === id);
              return <UserAvatar key={id} src={member?.avatarUrl} size={28} />;
            })}
            <div className="flex items-center px-3 py-2 bg-gray-200 rounded-2xl">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
  
        <ChatScrollHandler
        userId={currentUserId!}
          containerRef={containerRef}
          chatMessages={chatMessages}
          selectedConversation={selectedConversation}
          page={page}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
