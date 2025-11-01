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
import FriendList from "./friend-list";
import { getUser } from "@/services/userService";
import {
  getFriendList,
  getNoneFriendList,
  getFriendRequestList,
} from "@/services/friendService";
import { RelationshipStatus } from "@/types/friend";

export default function Profile() {
  const defaultAvatar = "/default-avatar.jpg";

  const dispatch = useAppDispatch();

  const params = useParams();
  const slug = params.slug as string;

  const currentUser = useAppSelector((state) => state.user.user);

  const [profileUser, setProfileUser] = React.useState(currentUser);
  const [relationship, setRelationship] =
    React.useState<RelationshipStatus>("none");
  const tabs = ["Bạn bè", "Lời mời kết bạn", "Người dùng khác"];
  const [active, setActive] = React.useState("Bạn bè");
  const [friends, setFriends] = React.useState<any[]>([]);

  const handleRelationshipChange = (newStatus: RelationshipStatus) => {
    setRelationship(newStatus);
  };

  const handleGetFriends = async (tab: string) => {
    try {
      let result: any[] = [];
      switch (tab) {
        case "Bạn bè":
          result = await getFriendList();
          break;
        case "Lời mời kết bạn":
          result = await getFriendRequestList();
          break;
        case "Người dùng khác":
          result = await getNoneFriendList();
          break;
        default:
          result = await getFriendList();
      }
      setFriends(result);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
    }
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

  React.useEffect(() => {
    handleGetFriends(active);
  }, [active]);

  return (
    <div className="min-h-screen">
      {/* Header luôn nằm trên */}
      <Header />

      {/* Nội dung profile */}
      <div className="flex justify-center shadow-sm">
        <div className="w-full xl:max-w-7xl px-4">
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
          <div className="w-full flex justify-center">
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
                      relationship={relationship}
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
                {/* tăng padding-bottom cho container để underline có chỗ hiện */}
                <ul className="flex gap-2 text-gray-600 font-medium mt-1 overflow-x-auto pb-1">
                  {tabs.map((tab) => (
                    <li
                      key={tab}
                      onClick={() => setActive(tab)}
                      className={`relative cursor-pointer rounded-md px-4 py-4 transition-all duration-150
                        dark:hover:bg-neutral-800 ${
                          active === tab ? "" : "hover:bg-gray-100"
                        }`}
                    >
                      <span
                        className={`${active === tab ? "text-blue-600" : ""}`}
                      >
                        {tab}
                      </span>

                      {/* underline: position absolute, nằm *bên dưới* ô (âm bottom) */}
                      {active === tab && (
                        <span className="absolute left-0 right-0 -bottom-1 h-0.75 bg-blue-600 rounded-full" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-300">
        <div className="flex justify-center shadow-sm pt-4">
          <div className="w-full xl:max-w-6xl px-4 py-4 bg-white rounded-xl">
            <FriendList tab={active} friends={friends} onChange={handleGetFriends}/>
          </div>
        </div>
      </div>
    </div>
  );
}
