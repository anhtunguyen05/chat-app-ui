"use client";

import { useState } from "react";
import { socket } from "@/lib/socket";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Icon } from "@/components/icon/icon";
import { sendMessage } from "@/services/chatService";
import { send } from "process";

export default function InputChat() {
  const [message, setMessage] = useState("");
  const currentUser = useAppSelector((state) => state.user.user);
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);

  const handleSend = () => {
    if (!message.trim() || !selectedUser || !currentUser) return;

    sendMessage(currentUser.id, selectedUser.id, message.trim());

    setMessage("");
  };
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-transparent dark:bg-neutral-900 border-t dark:border-neutral-800">
      {/* LEFT ICONS */}
      <div className="flex items-center gap-2 text-blue-600">
        <Icon
          name="mic"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        />
        <Icon
          name="image"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        />
        <Icon
          name="sticker"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        />
        <span className="font-bold text-sm cursor-pointer hover:opacity-80 text-violet-600">
          GIF
        </span>
      </div>

      {/* INPUT */}
      <div className="flex items-center flex-1 bg-gray-100 dark:bg-neutral-800 rounded-full px-4 py-2">
        <input
          type="text"
          placeholder="Aa"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500"
        />
        <Icon
          name="smile"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        />
      </div>

      {message.trim() ? (
        <Icon
          name="send"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
          onClick={handleSend}
        />
      ) : (
        <Icon
          name="thumbsUp"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        />
      )}
    </div>
  );
}
