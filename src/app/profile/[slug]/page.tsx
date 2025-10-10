"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Pencil,
  Camera,
  UserPlus,
  MessageCircle,
  UserCheck,
} from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  updateAvatarRequest,
  updateCoverRequest,
} from "@/features/user/userSlice";
import { Icon } from "@/components/icon/icon";
import Header from "@/components/header/header";
import UserAvatar from "@/components/user-avatar/user-avatar";
import UploadImageModal from "@/components/modals/upload-image-modal";
import ProfileModal from "@/components/modals/profile-modal";
import FriendButton from "./friend-button";
import { getUser } from "@/services/userService";

export default function Profile() {
  const defaultAvatar = "/default-avatar.jpg";

  const dispatch = useAppDispatch();

  const params = useParams();
  const slug = params.slug as string;

  const currentUser = useAppSelector((state) => state.user.user);

  const [profileUser, setProfileUser] = React.useState(currentUser);
  const [relationship, setRelationship] = React.useState("none");

  const handleRelationshipChange = (newStatus: string) => {
    setRelationship(newStatus);
  };

  React.useEffect(() => {
    if (slug === currentUser?.slug) {
      setProfileUser(currentUser);
    } else {
      const fetchUserBySlug = async () => {
        try {
          const res = await getUser(slug);
          setProfileUser(res.user);
          setRelationship(res.relationship);
        } catch (err) {
          console.error("Lỗi khi tải user:", err);
        }
      };
      fetchUserBySlug();
    }
  }, [slug, currentUser]);

  return (
    <div className="min-h-screen">
      {/* Header luôn nằm trên */}
      <Header />

      {/* Nội dung profile */}
      <div className="flex justify-center">
        <div className="w-full xl:max-w-5xl px-4">
          {/* Cover photo */}
          <div className="relative w-full h-100 bg-gray-300">
            <Image
              src={profileUser?.coverUrl || defaultAvatar}
              alt="cover"
              fill
              className="object-cover"
              priority
            />
            <UploadImageModal
              type="cover"
              onUpload={(file) => dispatch(updateCoverRequest({ file }))}
            >
              <button className="flex justify-center items-center gap-1 absolute bottom-3 right-3 bg-white px-3 py-1 rounded-md shadow text-sm">
                <Camera /> Thêm ảnh bìa
              </button>
            </UploadImageModal>
          </div>

          {/* Profile info */}
          <div className="w-full flex justify-center h-90">
            <div className="w-full px-4">
              {/* Avatar + Info */}
              <div className="flex items-end -mt-16">
                {/* Avatar */}
                <div className="relative">
                  <UserAvatar
                    src={profileUser?.avatarUrl}
                    size={170}
                    isOnline
                    className="border border-gray-200 hover:ring-2 hover:ring-gray-300"
                  />
                  <button
                    className="absolute bottom-2 right-2 rounded-full shadow"
                    aria-label="Open settings"
                  >
                    <UploadImageModal
                      type="avatar"
                      onUpload={(file) =>
                        dispatch(updateAvatarRequest({ file }))
                      }
                    >
                      <Icon name="camera"></Icon>
                    </UploadImageModal>
                  </button>
                </div>

                {/* Name + Friends */}
                <div className="ml-4 flex-1">
                  <h1 className="text-2xl font-bold">
                    {profileUser?.nickname}
                  </h1>
                  <p className="text-gray-600">466 người bạn</p>
                </div>

                {/* Actions */}
                {slug === currentUser?.slug && (
                  <div className="flex gap-2">
                    <ProfileModal classname="flex gap-2 bg-gray-200 px-3 py-2 rounded-md justify-center items-center">
                      <Pencil size={18} /> Chỉnh sửa
                    </ProfileModal>
                  </div>
                )}

                {slug !== currentUser?.slug && profileUser && (
                  <div className="flex gap-2">
                    <FriendButton
                      relationship={
                        relationship as
                          | "none"
                          | "pending_sent"
                          | "pending_received"
                          | "friends"
                      }
                      userId={profileUser.id}
                      onChange={handleRelationshipChange}
                    />
                    <div
                      className={`flex gap-2 px-3 py-2 rounded-md justify-center items-center ${
                        relationship === "friends"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                      }`}
                    >
                      <MessageCircle size={18} /> Nhắn tin
                    </div>
                  </div>
                )}
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
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
