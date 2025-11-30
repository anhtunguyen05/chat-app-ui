"use client";

import React from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { User } from "@/types/user";
import ChatItem from "@/components/sidebar/chat-sidebar/chat-item/chat-item";
import MessageItem from "@/components/message-item/message-item";
import {
  setConversationsRequest,
  setSelectedConversationRequest,
  setActiveTabRequest,
  // addOrUpdateConversationRequest
} from "@/features/chat/chatSlice";
import { Conversation } from "@/features/chat/chatType";

export default function ChatSidebar() {
  const dispatch = useAppDispatch();
  const { selectedConversation, activeTab, conversations, searchQuery } = useAppSelector(
    (state) => state.chat
  );
  const { user } = useAppSelector((state) => state.user);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    dispatch(setConversationsRequest());
    setLoading(false);
  }, []);

  // Filter conversations dựa trên activeTab và searchQuery
  const filteredConversations = React.useMemo(() => {
    let filtered = conversations;

    // Filter theo tab
    switch (activeTab) {
      case "unread":
        filtered = filtered.filter((conv) => !conv.isLastMessageRead);
        break;
      case "group":
        filtered = filtered.filter((conv) => conv.type === "group");
        break;
      case "all":
      default:
        break;
    }

    // Filter theo search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((conv) =>
        conv.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [conversations, activeTab, searchQuery]);

  if (loading) return <p>Loading friends...</p>;

  return (
    <div className="w-full max-w-sm mx-auto bg-white h-full">
      <div className="flex justify-between gap-4 px-4 py-2 p-4">
        <MessageItem
          active={activeTab === "all"}
          onClick={() => dispatch(setActiveTabRequest("all"))}
        >
          Tất cả
        </MessageItem>
        <MessageItem
          active={activeTab === "unread"}
          onClick={() => dispatch(setActiveTabRequest("unread"))}
        >
          Chưa đọc
        </MessageItem>
        <MessageItem
          active={activeTab === "group"}
          onClick={() => dispatch(setActiveTabRequest("group"))}
        >
          Nhóm
        </MessageItem>
      </div>
      <div className="overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            {activeTab === "unread" && "Không có tin nhắn chưa đọc"}
            {activeTab === "group" && "Không có nhóm nào"}
          </div>
        ) : (
          filteredConversations.map((conversation: Conversation) => {
            return (
              <ChatItem
                key={conversation.id}
                conversation={conversation}
                active={
                  selectedConversation
                    ? selectedConversation.id === conversation.id
                    : false
                }
                onClick={() =>
                  dispatch(setSelectedConversationRequest(conversation))
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
