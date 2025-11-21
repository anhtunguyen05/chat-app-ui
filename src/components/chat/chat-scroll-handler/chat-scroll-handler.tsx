import React, { use } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useThrottle } from "@/hooks/useThrottle";
import {
  fetchMessagesRequest,
  // updateMessageReadStatusRequest,
} from "@/features/chat/chatSlice";
import { Conversation } from "@/features/chat/chatType";
import { markMessagesAsRead } from "@/services/chatService";

interface ChatScrollHandlerProps {
  userId: string;
  latestMsg: any;
  lastReadMessageId: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  chatMessages: any[];
  selectedConversation: Conversation | null;
  page: number;
  hasMore: boolean;
   onReachBottom?: () => void; 
}

export default function ChatScrollHandler({
  userId,
  latestMsg,
  lastReadMessageId,
  containerRef,
  chatMessages,
  selectedConversation,
  page,
  hasMore,
}: ChatScrollHandlerProps) {
  const dispatch = useAppDispatch();
  const prevScrollHeight = React.useRef(0);

  const waitForImages = (container: HTMLElement) =>
    new Promise<void>((resolve) => {
      const imgs = container.querySelectorAll("img");
      let loaded = 0;
      if (imgs.length === 0) return resolve();
      imgs.forEach((img) => {
        if (img.complete) {
          loaded++;
          if (loaded === imgs.length) resolve();
        } else {
          img.addEventListener("load", () => {
            loaded++;
            if (loaded === imgs.length) resolve();
          });
          img.addEventListener("error", () => {
            loaded++;
            if (loaded === imgs.length) resolve();
          });
        }
      });
    });

  const handleScroll = useThrottle(() => {
    const container = containerRef.current;
    if (!container || !hasMore || !selectedConversation) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      10;

    if (isAtBottom) {
      markMessagesAsRead(
        userId,
        selectedConversation.id,
        selectedConversation.type === "group"
      );

      // dispatch(
      //   updateMessageReadStatusRequest({
      //     conversationId: selectedConversation.id,
      //   })
      // );

       
    }
    if (container.scrollTop <= 50) {
      prevScrollHeight.current = container.scrollHeight;
      dispatch(
        fetchMessagesRequest({
          type: selectedConversation.type,
          targetId: selectedConversation.id,
          page: page + 1,
        })
      );
    }
  }, 300);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    prevScrollHeight.current = 0;

    // Đợi tin nhắn render xong rồi mới cuộn xuống đáy
    waitForImages(container).then(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [selectedConversation?.id]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prevScrollHeight.current > 0) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeight.current;
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages]);

  return null; // Component này chỉ quản lý logic, không render gì
}
