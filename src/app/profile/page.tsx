"use client";

import React from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Icon } from "@/components/icon/icon";
import Header from "@/components/header/header";
import UserAvatar from "@/components/user-avatar/user-avatar";

export default function Profile() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen">
      {/* Header luôn nằm trên */}
      <Header />

      {/* Nội dung profile */}
      <div className="flex justify-center">
        <div className="w-full xl:max-w-7xl px-4">
          {/* Cover photo */}
          <div className="relative w-full h-100 bg-gray-300">
            <button className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-md shadow text-sm">
              Thêm ảnh bìa
            </button>
          </div>

          {/* Profile info */}
          <div className="w-full flex justify-center h-90">
            <div className="w-full px-4">
              {/* Avatar + Info */}
              <div className="flex items-end -mt-16">
                {/* Avatar */}
                <div className="relative">
                  <UserAvatar
                    src={currentUser?.avatarUrl}
                    size={170}
                    isOnline
                    className="border border-gray-200 hover:ring-2 hover:ring-gray-300"
                  />
                  <button
                    className="absolute bottom-2 right-2 rounded-full shadow"
                    aria-label="Open settings"
                  >
                    <Icon name="camera" ></Icon>
                  </button>
                </div>

                {/* Name + Friends */}
                <div className="ml-4 flex-1">
                  <h1 className="text-2xl font-bold">{currentUser?.nickname}</h1>
                  <p className="text-gray-600">466 người bạn</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-3 py-2 rounded-md">
                    + Thêm vào tin
                  </button>
                  <button className="bg-gray-200 px-3 py-2 rounded-md">
                    ✏️ Chỉnh sửa
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 border-t border-gray-300">
                <ul className="flex gap-6 text-gray-600 font-medium mt-2 overflow-x-auto">
                  <li className="cursor-pointer border-b-2 border-blue-600 text-blue-600 pb-2">
                    Bài viết
                  </li>
                  <li className="cursor-pointer hover:text-blue-600">
                    Giới thiệu
                  </li>
                  <li className="cursor-pointer hover:text-blue-600">Bạn bè</li>
                  <li className="cursor-pointer hover:text-blue-600">Ảnh</li>
                  <li className="cursor-pointer hover:text-blue-600">Video</li>
                  <li className="cursor-pointer hover:text-blue-600">Reels</li>
                  <li className="cursor-pointer hover:text-blue-600">
                    Xem thêm
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
