import React from "react";
import { Participant, Message } from "@/features/chat/chatType";

export const useMessageSeenBy = (
  participants: Participant[],
  chatMessages: Message[],
  currentUserId: string | undefined
) => {
  // Pre-compute lookup maps to avoid repeated searches
  const messageIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    chatMessages.forEach((msg: Message, index: number) => {
      if (msg?.id) {
        map.set(msg.id, index);
      }
    });
    return map;
  }, [chatMessages]);

  const messageTimeMap = React.useMemo(() => {
    const map = new Map<string, number>();
    chatMessages.forEach((msg: Message) => {
      if (msg?.id && msg?.createdAt) {
        map.set(msg.id, new Date(msg.createdAt).getTime());
      }
    });
    return map;
  }, [chatMessages]);

  const getSeenBy = React.useCallback(
    (messageId: string, senderId?: string): Participant[] => {
      if (!participants || participants.length === 0) {
        return [];
      }

      const currentMessageIndex = messageIndexMap.get(messageId);
      if (currentMessageIndex === undefined) return [];

      const currentMessageTime = messageTimeMap.get(messageId) ?? 0;

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

          const lastSeenMessageId = participant.lastSeenMessageId;

          if (lastSeenMessageId) {
            const lastSeenIndex = messageIndexMap.get(lastSeenMessageId);

            // Hiển thị avatar chỉ khi participant đã xem đúng tin nhắn này
            if (lastSeenIndex !== undefined) {
              return lastSeenIndex === currentMessageIndex;
            }

            // Nếu tin nhắn đó không còn trong danh sách hiện tại, nhưng ID vẫn trùng
            if (lastSeenMessageId === messageId) {
              return true;
            }
          }

          // Fallback sang compare theo thời gian lastSeenAt (nếu có)
          if (participant.lastSeenAt) {
            const lastSeenTime = new Date(participant.lastSeenAt).getTime();
            return Math.abs(lastSeenTime - currentMessageTime) < 5000; // 5s tolerance
          }

          return false;
        })
        .slice(0, 3); // Chỉ hiển thị tối đa 3 người

      return seen;
    },
    [participants, messageIndexMap, messageTimeMap, currentUserId]
  );

  return { getSeenBy };
};
