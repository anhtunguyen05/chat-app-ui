"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RelationshipStatus } from "@/types/friend";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  unfriend,
} from "@/services/friendService";

interface Friend {
  id: string;
  nickname?: string;
  slug: string;
  mutual?: string;
  avatar: string;
}

interface FriendRequestListProps {
  title?: string;
  friends: Friend[];
  tab: string;
  onChange: (tab: string) => void;
}

export default function FriendRequestList({
  title = "Lời mời kết bạn",
  friends,
  tab,
  onChange,
}: FriendRequestListProps) {
  const router = useRouter();

  const tabToRelationship: Record<string, RelationshipStatus> = {
    "Bạn bè": "friends",
    "Lời mời kết bạn": "pending_received",
    "Người dùng khác": "none",
  };

  const relationship = tabToRelationship[tab] ?? "none";

  const handleOnClick = (slug: string) => {
    router.push(`/${slug}`);
  };

  // ✅ Các hàm gọi API
  const handleAddFriend = async (id: string) => {
    try {
      await sendFriendRequest(id);
      onChange?.(tab);
    } catch (error) {
      console.error("❌ Lỗi khi gửi lời mời:", error);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await acceptFriendRequest(id);
      onChange?.(tab);
    } catch (error) {
      console.error("❌ Lỗi khi xác nhận:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectFriendRequest(id);
      onChange?.(tab);
    } catch (error) {
      console.error("❌ Lỗi khi từ chối:", error);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {friends.map((user) => (
          <div
            key={user.id}
            onClick={() => handleOnClick(user.slug)}
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden cursor-pointer"
          >
            <div className="w-full h-48 bg-gray-200 relative">
              <img
                src={user.avatar}
                alt={user?.nickname}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                {user?.nickname}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{user?.mutual}</p>

              {/* ✅ Nút theo relationship */}
              <div className="flex gap-2">
                {relationship === "none" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFriend(user.id);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-1.5 transition-colors"
                  >
                    Gửi kết bạn
                  </button>
                )}

                {relationship === "pending_received" && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirm(user.id);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-1.5 transition-colors"
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(user.id);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 font-medium rounded-md py-1.5 transition-colors"
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
