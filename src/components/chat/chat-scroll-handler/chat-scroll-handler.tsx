import React from "react";
import { useDispatch } from "react-redux";
import { fetchMessagesRequest } from "@/features/chat/chatSlice";

interface ChatScrollHandlerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  chatMessages: any[];
  selectedUser: { id: string } | null;
  page: number;
  hasMore: boolean;
}

export default function ChatScrollHandler({
  containerRef,
  chatMessages,
  selectedUser,
  page,
  hasMore,
}: ChatScrollHandlerProps) {
  const dispatch = useDispatch();
  const [prevScrollHeight, setPrevScrollHeight] = React.useState(0);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!containerRef.current || !hasMore || !selectedUser) return;
      if (containerRef.current.scrollTop <= 50) {
        setPrevScrollHeight(container.scrollHeight);
        dispatch(
          fetchMessagesRequest({ userId: selectedUser.id, page: page + 1 })
        );
      }
    };

    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [dispatch, hasMore, page, selectedUser]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    setPrevScrollHeight(0);

    // Đợi tin nhắn render xong rồi mới cuộn xuống đáy
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 150);
  }, [selectedUser?.id]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prevScrollHeight > 0) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeight;
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages]);

  return null; // Component này chỉ quản lý logic, không render gì
}
