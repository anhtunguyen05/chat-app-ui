import React, { use } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useThrottle } from "@/hooks/useThrottle";
import {
  fetchMessagesRequest,
  updateMessageReadStatusRequest,
} from "@/features/chat/chatSlice";
import { Conversation } from "@/features/chat/chatType";
import { markMessagesAsRead } from "@/services/chatService";

interface ChatScrollHandlerProps {
  userId: string;
  latestMsg: any;
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

  const checkIsAtBottom = React.useCallback(() => {
    const container = containerRef.current;
    if (!container || !selectedConversation) return false;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - clientHeight - scrollTop;

    const isAtBottom = Math.abs(distanceFromBottom) < 10;

    return isAtBottom;
  }, [selectedConversation]);

  const handleScrollCallback = React.useCallback(() => {
    const container = containerRef.current;
    if (!container || !selectedConversation) return;

    const isAtBottom = checkIsAtBottom();

    if (isAtBottom) {
      console.log("📬 Reached bottom of chat.");
      markMessagesAsRead(userId, selectedConversation.id);

      dispatch(
        updateMessageReadStatusRequest({
          conversationId: selectedConversation.id,
        })
      );
    }

    // Load more messages khi scroll lên đầu (chỉ khi còn hasMore)
    if (hasMore && container.scrollTop <= 50) {
      prevScrollHeight.current = container.scrollHeight;
      dispatch(
        fetchMessagesRequest({
          conversationId: selectedConversation.id,
          page: page + 1,
        })
      );
    }
  }, [checkIsAtBottom, selectedConversation, userId, dispatch, hasMore, page]);

  const handleScroll = useThrottle(handleScrollCallback, 300);

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
      
      // Kiểm tra isAtBottom sau khi scroll tự động
      setTimeout(() => {
        const isAtBottom = checkIsAtBottom();
        if (isAtBottom && selectedConversation) {
          console.log("📬 Initial scroll to bottom, marking as read.");
          markMessagesAsRead(userId, selectedConversation.id);
          dispatch(
            updateMessageReadStatusRequest({
              conversationId: selectedConversation.id,
            })
          );
        }
      }, 100);
    });
  }, [selectedConversation?.id, checkIsAtBottom, selectedConversation, userId, dispatch]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prevScrollHeight.current > 0) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeight.current;
    } else {
      container.scrollTop = container.scrollHeight;
    }

    // Kiểm tra isAtBottom sau khi scroll tự động
    // Sử dụng setTimeout để đảm bảo DOM đã cập nhật
    setTimeout(() => {
      const isAtBottom = checkIsAtBottom();
      if (isAtBottom && selectedConversation) {
        console.log("📬 Auto-scrolled to bottom, marking as read.");
        markMessagesAsRead(userId, selectedConversation.id);
        dispatch(
          updateMessageReadStatusRequest({
            conversationId: selectedConversation.id,
          })
        );
      }
    }, 100);
  }, [chatMessages, checkIsAtBottom, selectedConversation, userId, dispatch]);

  return null; // Component này chỉ quản lý logic, không render gì
}
