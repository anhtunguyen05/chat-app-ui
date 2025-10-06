"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { updateNicknameRequest, resetSuccess } from "@/features/user/userSlice";
import UserAvatar from "@/components/user-avatar/user-avatar";
import AvatarModal from "@/components/modals/avatar-modal";

interface ProfileModalProps {
  children: React.ReactNode;
  classname?: string;
}

export default function ProfileModal({
  children,
  classname,
}: ProfileModalProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.user);
  const [open, setOpen] = React.useState(false);
  const [nickname, setNickname] = React.useState("");

  const handleSaveNickname = () => {
    dispatch(updateNicknameRequest({ nickname }));
    setOpen(false);
  };

  React.useEffect(() => {
    if (currentUser?.nickname) {
      setNickname(currentUser.nickname);
    }
  }, [currentUser]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={classname}>
        <Button variant="outline">{children}</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        {/* Header */}
        <DialogHeader className="flex items-center justify-between sr-only">
          <DialogTitle className="text-lg font-semibold">
            Chỉnh sửa trang cá nhân
          </DialogTitle>
        </DialogHeader>

        {/* Nội dung */}
        <div className="flex flex-col items-center py-6">
          {/* Title + Add button */}
          <div className="w-full flex justify-between items-center mb-2">
            <p className="font-medium">Ảnh đại diện</p>
            <AvatarModal>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                Thêm
              </Button>
            </AvatarModal>
          </div>

          {/* Avatar */}
          <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <UserAvatar
              src={currentUser?.avatarUrl}
              size={170}
              isOnline
              className="border border-gray-200 hover:ring-2 hover:ring-gray-300"
            />
          </div>

          {/* ===== Nickname Section ===== */}
          <div className="w-full space-y-2">
            <p className="font-medium">Tên hiển thị</p>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nhập tên hiển thị mới"
            />
            <div className="flex justify-end">
              <Button onClick={handleSaveNickname}>Lưu</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
