"use client";

import React from "react";
import { socket } from "@/lib/socket";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchMessagesRequest,
  setParticipantsRequest,
} from "@/features/chat/chatSlice";
import ChatScrollHandler from "@/components/chat/chat-scroll-handler/chat-scroll-handler";
import MessageBubble from "./message-bubble";
import TypingIndicator from "./typing-indicator";
import { useMessageSeenBy } from "./hooks/useMessageSeenBy";
import { useSocketEvents } from "./hooks/useSocketEvents";
import { Message } from "@/features/chat/chatType";

export default function ContainerChat() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.user.user?.id);
  const { selectedConversation, hasMore, page, participants } = useAppSelector(
    (state) => state.chat
  );

  const chatMessages: Message[] = useAppSelector((state) => state.chat.messages) || [];

  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Custom hooks
  const { getSeenBy } = useMessageSeenBy(
    participants,
    chatMessages,
    currentUserId
  );

  useSocketEvents(
    selectedConversation,
    currentUserId,
    setTypingUsers
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

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-3 bg-container"
      ref={containerRef}
    >
      <div className="flex flex-col justify-end min-h-full space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-4">
            Chưa có tin nhắn nào
          </div>
        )}

        {chatMessages.map((msg: Message) => {
          const isMine = msg.sender?.id === currentUserId;
          const seenBy = getSeenBy(msg.id, msg.sender?.id);

          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMine={isMine}
              selectedConversation={selectedConversation}
              chatMessages={chatMessages}
              seenBy={seenBy}
            />
          );
        })}

        <TypingIndicator
          typingUsers={typingUsers}
          participants={participants}
        />

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
