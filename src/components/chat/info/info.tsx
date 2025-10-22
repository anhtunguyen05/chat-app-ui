'use client';

import React from "react";
import Image from "next/image";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchMessagesRequest } from "@/features/chat/chatSlice";

export default function Info() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.user.user?.id);
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);
  const chatMessages = useAppSelector((state) => state.chat.messages) || [];

  React.useEffect(() => {
    if (selectedUser?.id) {
      dispatch(fetchMessagesRequest(selectedUser.id));
    }
  }, [dispatch, selectedUser]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-transparent">
      {chatMessages.length === 0 && (
        <div className="text-center text-gray-400 text-sm mt-4">
          Chưa có tin nhắn nào
        </div>
      )}

      {chatMessages.map((msg: any) => {
        const isMine = msg.sender?.id === currentUserId;

        return (
          <div
            key={msg._id}
            className={`flex items-end ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar của người khác */}
            {!isMine && msg.sender.avatarUrl && (
              <Image
                src={msg.sender.avatarUrl}
                alt={msg.sender.nickname}
                width={32}
                height={32}
                className="rounded-full mr-2"
              />
            )}

            {/* Bubble tin nhắn */}
            <div
              className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm break-words ${
                isMine
                  ? "bg-violet-600 text-white rounded-br-none"
                  : "bg-gray-200 text-black rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
