import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Icon } from "@/components/icon/icon";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { User } from "@/types/user";

interface HeaderChatProps {
  selectedUser: User;
}

export default function HeaderChat({ selectedUser }: HeaderChatProps) {
  const isOnline = useAppSelector((state) =>
    state.chat.onlineList.includes(selectedUser.id)
  );

  const formatLastSeen = (time: any) => {
    if (!time) return "";
    const diffMs = Date.now() - new Date(time).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `Hoạt động ${diffMin} phút trước`;
    const diffHr = Math.floor(diffMin / 60);
    return `Hoạt động ${diffHr} giờ trước`;
  };

  return (
    <div className="flex w-full h-16 items-center justify-between px-4 py-2 shadow-sm bg-white dark:bg-neutral-900">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3">
        <UserAvatar></UserAvatar>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-xl md:text-xl text-neutral-900 dark:text-white">
            {selectedUser.nickname}
          </span>
          <p className="text-sm text-gray-500">
            {isOnline
              ? "Đang hoạt động"
              : formatLastSeen(selectedUser.lastSeen)}
          </p>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-4">
        <Icon
          name="phone"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        ></Icon>
        <Icon
          name="video"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        ></Icon>
        <Icon
          name="info"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        ></Icon>
      </div>
    </div>
  );
}
