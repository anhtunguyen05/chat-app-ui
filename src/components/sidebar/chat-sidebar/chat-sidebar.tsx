"use client";

import React from "react";
import { User } from "@/types/user";
import ChatItem from "@/components/sidebar/chat-sidebar/chat-item/chat-item";
import MessageItem from "@/components/message-item/message-item";
import { getFriendList } from "@/services/friendService";

export default function ChatSidebar() {
  const [tab, setTab] = React.useState("all");
  const [chats, setChats] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchFriends() {
      try {
        const data = await getFriendList();
        setChats(data);
      } catch (err) {
        console.error("Failed to load friends:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
  }, []);

  if (loading) return <p>Loading friends...</p>;

  return (
    <div className="w-full max-w-sm mx-auto bg-white h-full">
      <div className="flex justify-between gap-4 px-4 py-2 p-4">
        <MessageItem active={tab === "all"} onClick={() => setTab("all")}>
          Tất cả
        </MessageItem>
        <MessageItem active={tab === "unread"} onClick={() => setTab("unread")}>
          Chưa đọc
        </MessageItem>
        <MessageItem active={tab === "group"} onClick={() => setTab("group")}>
          Nhóm
        </MessageItem>
      </div>
      <div className="overflow-y-auto">
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            avatarUrl={chat.avatarUrl}
            nickname={chat.nickname}
          />
        ))}
      </div>
    </div>
  );
}
