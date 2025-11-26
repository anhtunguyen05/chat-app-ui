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
  setParticipantsRequest,
  updateParticipantSeenMessageRequest,
} from "@/features/chat/chatSlice";
import UserAvatar from "@/components/user-avatar/user-avatar";
import ChatScrollHandler from "@/components/chat/chat-scroll-handler/chat-scroll-handler";
import { Participant } from "@/features/chat/chatType";

export default function Info() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.user.user?.id);
  const { selectedConversation, hasMore, page, participants } = useAppSelector(
    (state) => state.chat
  );

  const chatMessages = useAppSelector((state) => state.chat.messages) || [];

  // Pre-compute lookup maps to avoid repeated searches
  const messageIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    chatMessages.forEach((msg: any, index: number) => {
      if (msg?.id) {
        map.set(msg.id, index);
      }
    });
    return map;
  }, [chatMessages]);

  const messageTimeMap = React.useMemo(() => {
    const map = new Map<string, number>();
    chatMessages.forEach((msg: any) => {
      if (msg?.id && msg?.createdAt) {
        map.set(msg.id, new Date(msg.createdAt).getTime());
      }
    });
    return map;
  }, [chatMessages]);

  const [isTyping, setIsTyping] = React.useState(false);
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Helper function để tính toán những người đã xem tin nhắn
  // Trong group: hiển thị avatar đã xem cho cả tin nhắn của mình và người khác
  // Trong private: chỉ hiển thị cho tin nhắn của mình
  const getSeenBy = React.useCallback(
    (messageId: string, isMine: boolean, senderId?: string): Participant[] => {
      if (!participants || participants.length === 0) {
        return [];
      }

      const currentMessageIndex = messageIndexMap.get(messageId);
      if (currentMessageIndex === undefined) return [];

      const currentMessageTime = messageTimeMap.get(messageId) ?? 0;

      // Tìm những người đã xem tin nhắn này
      // Ưu tiên so sánh theo index (do mảng đã được sắp xếp)
      // Chỉ hiển thị avatar dưới đúng tin nhắn mà participant đã xem (lastSeenMessageId === messageId)
      // Nếu không tìm thấy index tương ứng (tin nhắn chưa nằm trong batch hiện tại),
      // fallback sang timestamp `lastSeenAt` để so sánh chính xác hơn
      const seen = participants
        .filter((participant: Participant) => {
          // Bỏ qua chính mình (người đang xem)
          if (participant.id === currentUserId) return false;

          // Bỏ qua người gửi tin nhắn (không hiện avatar đã xem của chính người gửi)
          if (senderId && participant.id === senderId) return false;

          // Nếu không có lastSeenMessageId, chưa xem
          if (!participant.lastSeenMessageId) {
            return false;
          }

          // Ưu tiên so sánh theo index
          const lastSeenMessageId = participant.lastSeenMessageId;

          if (lastSeenMessageId) {
            const lastSeenIndex = messageIndexMap.get(lastSeenMessageId);

            // Hiển thị avatar chỉ khi participant đã xem đúng tin nhắn này
            if (lastSeenIndex !== undefined) {
              return lastSeenIndex === currentMessageIndex;
            }

            // Nếu tin nhắn đó không còn trong danh sách hiện tại, nhưng ID vẫn trùng
            // thì kiểm tra trực tiếp ID
            if (lastSeenMessageId === messageId) {
              return true;
            }
          }

          // Nếu không tìm thấy index và không có ID phù hợp,
          // fallback sang compare theo thời gian lastSeenAt (nếu có)
          if (participant.lastSeenAt) {
            const lastSeenTime = new Date(participant.lastSeenAt).getTime();
            // Chỉ xem như đã đọc nếu thời điểm đọc nằm trong khoảng ngay sau tin nhắn này
            // (giả định người dùng đọc đến tin nhắn này và chưa chắc đã đọc tin tiếp theo)
            return Math.abs(lastSeenTime - currentMessageTime) < 5000; // 5s tolerance
          }

          return false;
        })
        .slice(0, 3); // Chỉ hiển thị tối đa 3 người

      return seen;
    },
    [participants, messageIndexMap, messageTimeMap, currentUserId]
  );

  React.useEffect(() => {
    if (!selectedConversation) return;

    socket.emit("joinConversation", {
      conversationId: selectedConversation.id,
    });

    dispatch(
      fetchMessagesRequest({
        conversationId: selectedConversation.id,
        page: 1,
      })
    );

    dispatch(
      setParticipantsRequest({
        conversationId: selectedConversation.id,
      })
    );

    return () => {
      socket.emit("leaveConversation", {
        conversationId: selectedConversation.id,
      });
    };
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

    const handleMessageRead = ({
      conversationId,
      userId,
      lastSeenMessage,
    }: {
      conversationId: string;
      userId: string;
      lastSeenMessage: string;
    }) => {
      // Chỉ xử lý nếu là conversation đang mở
      if (conversationId !== selectedConversation.id) return;

      // Không cập nhật cho chính mình
      if (userId === currentUserId) return;

      dispatch(
        updateParticipantSeenMessageRequest({
          userId,
          lastSeenMessage,
        })
      );
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messageRead", handleMessageRead);
    };
  }, [selectedConversation, currentUserId, dispatch]);

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

          // Tính toán những người đã xem tin nhắn này
          const seenBy = getSeenBy(msg.id, isMine, msg.sender?.id);

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

                {/* ------------------ PRIVATE – avatar đã đọc ------------------ */}
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

                {/* ------------------ GROUP – nhiều avatar đã đọc ------------------ */}
                {seenBy.length > 0 &&
                  selectedConversation?.type === "group" && (
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
        })}

        {typingUsers.length > 0 && (
          <div className="flex items-end gap-2 justify-start">
            {/* Avatar của tối đa 2 người đang typing */}
            {typingUsers.slice(0, 2).map((oderId) => {
              const typingParticipant = participants.find(
                (p) => p.userId === oderId
              );

              return (
                <UserAvatar
                  key={oderId}
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
        )}

        <ChatScrollHandler
          userId={currentUserId!}
          latestMsg={chatMessages[chatMessages.length - 1]}
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
