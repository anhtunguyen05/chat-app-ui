"use client";

import React from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { User } from "@/types/user";
import ChatItem from "@/components/sidebar/chat-sidebar/chat-item/chat-item";
import MessageItem from "@/components/message-item/message-item";
import {
  setChatsRequest,
  setSelectedUserRequest,
  setActiveTabRequest,
} from "@/features/chat/chatSlice";

export default function ChatSidebar() {
  const dispatch = useAppDispatch();
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);
  const activeTab = useAppSelector((state) => state.chat.activeTab);
  const chats = useAppSelector((state) => state.chat.chats);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    dispatch(setChatsRequest());
    setLoading(false);
  }, []);

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
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            avatarUrl={chat.avatarUrl}
            nickname={chat.nickname}
            onClick={() => {
              dispatch(setSelectedUserRequest(chat));
            }}
            active={selectedUser?.id === chat.id}
          />
        ))}
      </div>
    </div>
  );
}
