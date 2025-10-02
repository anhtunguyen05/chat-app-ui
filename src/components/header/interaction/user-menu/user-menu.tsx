"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/icon/icon";
import ThemeToggle from "@/components/header/interaction/user-menu/theme-toggle";
import { ReactNode } from "react";
import UserAvatar from "@/components/user-avatar/user-avatar";

interface UserDropdownProps {
  children: ReactNode; // ✅ nhận children làm trigger
  name?: string;
  email?: string;
  avatarUrl?: string;
  onLogout?: () => void;
  onMoveToProfile?: () => void;
}

export default function UserDropdown({
  children,
  name = "User",
  email,
  avatarUrl,
  onLogout,
  onMoveToProfile,
}: UserDropdownProps) {
  return (
    <DropdownMenu>
      {/* Trigger: Bất kỳ component nào truyền vào */}
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-56"
      >
        <DropdownMenuItem onClick={onMoveToProfile} className="cursor-pointer">
          <UserAvatar
            src={avatarUrl}
            size={32}
            isOnline
            className="border border-gray-200 hover:ring-2 hover:ring-gray-300"
          />
          <p className="font-medium">{name}</p>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <ThemeToggle></ThemeToggle>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="text-red-500 cursor-pointer"
        >
          <Icon name="logout" buttonClassName="w-8 h-8"></Icon>
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
