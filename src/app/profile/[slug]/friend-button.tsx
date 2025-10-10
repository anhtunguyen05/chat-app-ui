"use client";

import React, { useState } from "react";
import { UserPlus, UserCheck, Check, X } from "lucide-react";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  unfriend,
} from "@/services/friendService";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FriendButtonProps {
  userId: string;
  relationship: "none" | "pending_sent" | "pending_received" | "friends";
  onChange: (newStatus: "none" | "pending_sent" | "pending_received" | "friends") => void;
}


export default function FriendButton({
   userId,
  relationship,
  onChange,
}: FriendButtonProps) {
 
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);

       let newStatus = relationship;

      switch (relationship) {
        case "none":
          await sendFriendRequest(userId);
          newStatus = "pending_sent";
          break;

        case "pending_sent":
          await cancelFriendRequest(userId);
          newStatus = "none";
          break;

        case "friends":
          await unfriend(userId);
          newStatus = "none";
          break;
      }

       onChange(newStatus);
    } catch (err) {
      console.error("Friend action error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    await acceptFriendRequest(userId);
    onChange("friends");
  };

  const handleReject = async () => {
    await rejectFriendRequest(userId);
    onChange("none");
  };


  if (relationship === "pending_received") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex gap-2 px-3 py-2 rounded-md items-center bg-gray-300 hover:bg-gray-400 text-gray-700">
            <UserCheck size={18} />
            Phản hồi
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={handleAccept}
            className="flex items-center gap-2"
          >
            <Check size={16} /> Đồng ý
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleReject}
            className="flex items-center gap-2"
          >
            <X size={16} /> Từ chối
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const getDisplay = () => {
    switch (relationship) {
      case "pending_sent":
        return { icon: <UserCheck size={18} />, text: "Đã gửi lời mời" };
      case "friends":
        return { icon: <UserCheck size={18} />, text: "Bạn bè" };
      default:
        return { icon: <UserPlus size={18} />, text: "Thêm bạn bè" };
    }
  };

  const { icon, text } = getDisplay();

  return (
    <div
      onClick={handleClick}
      className={`flex gap-2 items-center px-3 py-2 rounded-md ${
        relationship === "none"
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-gray-300 hover:bg-gray-400 text-gray-700"
      }`}
    >
      {icon}
      {loading ? "Đang xử lý..." : text}
    </div>
  );
}
