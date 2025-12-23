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
  const isLoadingMore = React.useRef(false);
  const prevMessageCount = React.useRef(0);

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
      if (!selectedConversation.isLastMessageRead) {
        markMessagesAsRead(userId, selectedConversation.id);

        dispatch(
          updateMessageReadStatusRequest({
            conversationId: selectedConversation.id,
          })
        );
      }
    }

    if (hasMore && container.scrollTop <= 100 && !isLoadingMore.current) {
      isLoadingMore.current = true;
      prevScrollHeight.current = container.scrollHeight;
      console.log(`📜 Loading more messages, page: ${page + 1}`);
      dispatch(
        fetchMessagesRequest({
          conversationId: selectedConversation.id,
          page: page + 1,
        })
      );
    }
  }, [checkIsAtBottom, selectedConversation, userId, dispatch, hasMore, page]);

  const handleScroll = useThrottle(handleScrollCallback, 50);

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
    prevMessageCount.current = 0;
    isLoadingMore.current = false;

    waitForImages(container).then(() => {
      container.scrollTop = container.scrollHeight;

      setTimeout(() => {
        const isAtBottom = checkIsAtBottom();
        if (
          isAtBottom &&
          selectedConversation &&
          !selectedConversation.isLastMessageRead
        ) {
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
  }, [selectedConversation?.id]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const messageCountChanged =
      chatMessages.length !== prevMessageCount.current;
    const isNewMessage = chatMessages.length > prevMessageCount.current;
    const messagesAdded = chatMessages.length - prevMessageCount.current;

    prevMessageCount.current = chatMessages.length;

    if (prevScrollHeight.current > 0) {
      console.log("📜 Restoring scroll position after loading more messages");
      setTimeout(() => {
        const newScrollHeight = container.scrollHeight;
        const scrollDiff = newScrollHeight - prevScrollHeight.current;
        container.scrollTop = scrollDiff + 200; // Thêm buffer để tránh trigger ngay

        // Reset flags sau một khoảng delay nhỏ để tránh trigger ngay lập tức
        setTimeout(() => {
          prevScrollHeight.current = 0;
          isLoadingMore.current = false;
          console.log(`📜 Scroll restored. Ready for next load. hasMore: ${hasMore}`);
        }, 150);
      }, 50);
      return;
    }

    // Nếu là tin nhắn mới (ở cuối) - scroll xuống và mark as read nếu đang ở bottom
    if (isNewMessage && messagesAdded > 0 && prevScrollHeight.current === 0) {
      const wasAtBottom = checkIsAtBottom();

      // Scroll xuống đáy
      container.scrollTop = container.scrollHeight;

      // Mark as read nếu đang ở bottom (xử lý cả tin nhắn của mình và người khác)
      setTimeout(() => {
        const isAtBottom = checkIsAtBottom();
        if (isAtBottom && selectedConversation) {
          // Luôn gọi API mark as read để đảm bảo đồng bộ với server
          markMessagesAsRead(userId, selectedConversation.id);
          
          // Update local state nếu chưa được mark
          if (!selectedConversation.isLastMessageRead) {
            dispatch(
              updateMessageReadStatusRequest({
                conversationId: selectedConversation.id,
              })
            );
          }
        }
      }, 100);
    }
  }, [chatMessages.length]);

  return null; 
}
