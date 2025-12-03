import React from "react";
import { socket } from "@/lib/socket";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { updateParticipantSeenMessageRequest } from "@/features/chat/chatSlice";
import { Conversation } from "@/features/chat/chatType";

export const useSocketEvents = (
  selectedConversation: Conversation | null,
  currentUserId: string | undefined,
  setIsTyping: (value: boolean) => void,
  setTypingUsers: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (!selectedConversation) return;

    const handleTyping = ({
      senderId,
      conversationId,
    }: {
      senderId: string;
      conversationId: string;
    }) => {
      if (senderId === currentUserId) return;
      if (conversationId !== selectedConversation.id) return;

      setIsTyping(true);
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

      setTypingUsers((prev) => {
        const newUsers = prev.filter((id) => id !== senderId);
        if (newUsers.length === 0) {
          setIsTyping(false);
        }
        return newUsers;
      });
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
      if (conversationId !== selectedConversation.id) return;
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
  }, [
    selectedConversation,
    currentUserId,
    dispatch,
    setIsTyping,
    setTypingUsers,
  ]);
};
