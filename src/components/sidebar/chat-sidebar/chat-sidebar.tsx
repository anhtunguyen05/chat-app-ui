"use client";

import React from "react";
import ChatItem from "@/components/sidebar/chat-sidebar/chat-item/chat-item";
import MessageItem from "@/components/message-item/message-item";

const chats = [
  {
    avatar: "/avatars/bot.png",
    name: "bột",
    message: "Bạn đã gửi một nhắn dán.",
    time: "3 phút",
    unread: true,
  },
  {
    avatar: "/avatars/plaza2.jpg",
    name: "plaza 2",
    message: "chó giữ nhà: hít le",
    time: "1 giờ",
  },
  {
    avatar: "/avatars/mathet.jpg",
    name: "mất hết",
    message: "mất hết đã gửi một file đính kèm.",
    time: "3 giờ",
  },
  {
    avatar: "/avatars/hatuyet.jpg",
    name: "Ha Tuyet",
    message: "Đồ đẹp còn chế",
    time: "3 giờ",
  },
  {
    avatar: "/avatars/fpt.png",
    name: "FPT - Fuda Chat",
    message: "Hưng: 👋",
    time: "4 giờ",
    unread: true,
  },
  {
    avatar: "/avatars/fpt.png",
    name: "Cục Học Tập FU",
    message: "Hưng: 👋",
    time: "4 giờ",
    unread: true,
  },
  {
    avatar: "/avatars/tfm.png",
    name: "Săn deal cùng TFM",
    message: "Air Force 1 tối nay có mã giá...",
    time: "5 giờ",
  },
  {
    avatar: "/avatars/maidat.jpg",
    name: "Mai Đạt đẹp trai nhất thế giới",
    message: "Cuộc gọi nhỡ",
    time: "7 giờ",
    missedCall: true,
  },
];

export default function ChatSidebar() {
  const [tab, setTab] = React.useState("all");
  return (
    <div className="w-full max-w-sm mx-auto bg-white shadow overflow-y-auto h-screen">
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
      {/* {chats.map((chat, index) => (
        <ChatItem key={index} {...chat} />
      ))} */}
    </div>
  );
}
