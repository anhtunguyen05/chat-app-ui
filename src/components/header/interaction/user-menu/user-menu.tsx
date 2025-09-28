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
// import { getProfile } from "@/services/userService";

interface UserDropdownProps {
  children: ReactNode; // ✅ nhận children làm trigger
  name?: string;
  email?: string;
  onLogout?: () => void;
}

const toggleDarkMode = async () => {
  // await getProfile();
};

export default function UserDropdown({
  children,
  name = "User",
  email,
  onLogout,
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
        <div className="px-3 py-2 border-b">
          <p className="font-medium">{name}</p>
          {email && <p className="text-sm text-gray-500">{email}</p>}
        </div>

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
