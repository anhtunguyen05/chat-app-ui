"use client";

import React from "react";
import Image from "next/image";
import { socket } from "@/lib/socket";
import { isOnlyEmoji } from "@/lib/utils";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchMessagesRequest,
  setLastReadMessageIdRequest,
} from "@/features/chat/chatSlice";
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
  const lastReadMessageId = useAppSelector(
    (state) => state.chat.lastReadMessageId
  );

  const [isTyping, setIsTyping] = React.useState(false);
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);

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

    socket.emit("joinConversation", {
      conversationId: selectedConversation.id,
    });

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

    return () => {
      socket.emit("leaveConversation", {
        conversationId: selectedConversation.id,
      });
    }
  }, [dispatch, selectedConversation]);

  React.useEffect(() => {
    if (!selectedConversation) return;

    const handleTyping = ({
      senderId,
      conversationId,
    }: {
      senderId: string;
      conversationId: string;
    }) => {
      // Không hiển thị typing của chính mình
      if (senderId === currentUserId) return;

      // Chỉ hiển thị nếu là conversation đang mở
      if (conversationId !== selectedConversation.id) return;

      setIsTyping(true);

      // Lưu danh sách người đang typing (group)
      setTypingUsers((prev) =>
        prev.includes(senderId) ? prev : [...prev, senderId]
      );
    };

    const handleStopTyping = ({
      senderId,
      conversationId,
    }: {
      senderId: string;
      conversationId: string;
    }) => {
      if (conversationId !== selectedConversation.id) return;

      setTypingUsers((prev) => prev.filter((id) => id !== senderId));

      if (typingUsers.length <= 1) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [selectedConversation]);

  // React.useEffect(() => {
  //   if (!chatMessages || chatMessages.length === 0) return;

  //   const myMessages: any = chatMessages.filter(
  //     (m: any) => m.sender?.id === currentUserId
  //   );

  //   if (myMessages.length === 0) {
  //     dispatch(setLastReadMessageIdRequest(null));
  //     return;
  //   }

  //   const unreadMyMessages: any = myMessages.filter((m: any) => !m.isRead);

  //   if (unreadMyMessages.length > 0) {
  //     const firstUnread = unreadMyMessages[0] as any;
  //     const index = myMessages.findIndex((m: any) => m.id === firstUnread.id);

  //     if (index > 0) {
  //       dispatch(setLastReadMessageIdRequest(myMessages[index - 1].id));
  //       return;
  //     }

  //     dispatch(setLastReadMessageIdRequest(null));
  //     return;
  //   }

  //   // Không có tin chưa đọc => tin cuối của mình đã đọc
  //   dispatch(setLastReadMessageIdRequest(myMessages[myMessages.length - 1].id));
  // }, [selectedConversation]);

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

          // Avatar người khác
          const showAvatar =
            !isMine &&
            (selectedConversation?.type === "group" || chatMessages.length > 1);

          const isLastRead = msg.id === lastReadMessageId;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              {/* 🔹 Avatar trái (chỉ hiện nếu là tin nhắn người khác) */}
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

              {/* 🔹 Wrapper bong bóng + avatar đã đọc */}
              <div className="flex flex-col max-w-[70%]">
                {/* ------------------ BONG BÓNG TIN NHẮN ------------------ */}
                <div
                  className={`rounded-2xl overflow-hidden ${
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
                        hasImages ? "border-t border-black/10" : ""
                      }`}
                    >
                      {isOnlyEmoji(msg.text) ? (
                        <span className="text-3xl leading-none">
                          {msg.text}
                        </span>
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </div>
                  )}
                </div>
                {/* -------------------------------------------------------- */}

                {/* ------------------ PRIVATE – avatar đã đọc ------------------ */}
                {isMine &&
                  isLastRead &&
                  selectedConversation?.type === "private" && (
                    <div className="mt-1 self-end">
                      <UserAvatar src={selectedConversation.avatar} size={18} />
                    </div>
                  )}

                {/* ------------------ GROUP – nhiều avatar đã đọc ------------------ */}
                {isMine &&
                  isLastRead &&
                  selectedConversation?.type === "group" &&
                  Array.isArray(msg.readBy) &&
                  msg.readBy.length > 0 && (
                    <div className="flex mt-1 -space-x-2 self-end">
                      {msg.readBy.slice(0, 3).map((memberId: string) => {
                        const member = members.find(
                          (m: Member) => m.id === memberId
                        );
                        return (
                          <UserAvatar
                            key={memberId}
                            src={member?.avatarUrl}
                            size={18}
                          />
                        );
                      })}
                    </div>
                  )}
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex items-end gap-2 justify-start">
            {/* Avatar của tối đa 2 người đang typing */}
            {typingUsers.slice(0, 2).map((userId) => {
              const member = members.find((m) => m.id === userId);

              return (
                <UserAvatar
                  key={userId}
                  src={member?.avatarUrl || "/default-avatar.png"}
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
        )}

        <ChatScrollHandler
          userId={currentUserId!}
          latestMsg={chatMessages[chatMessages.length - 1]}
          lastReadMessageId={lastReadMessageId}
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
