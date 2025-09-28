"use client";

import {
  Bell,
  User,
  Settings,
  LogOut,
  Home,
  Menu,
  Search,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const Icons = {
  bell: Bell,
  user: User,
  settings: Settings,
  logout: LogOut,
  home: Home,
  menu: Menu,
  search: Search,
  moon: Moon,
  sun: Sun,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof Icons;
  size?: number; // 👉 size của icon SVG
  className?: string; // 👉 class của icon SVG
  buttonClassName?: string; // 👉 class của button (để chỉnh width/height)
}

export function Icon({
  name,
  size = 20,
  className,
  buttonClassName,
  ...iconProps
}: IconProps) {
  const LucideIcon = Icons[name];

  return (
    <button
      type="button"
      className={`flex items-center justify-center
                  rounded-full bg-gray-200 dark:bg-gray-900 hover:bg-gray-300
                  transition-colors ${buttonClassName ?? "w-10 h-10"}`}
    >
      <LucideIcon size={size} className={className} {...iconProps} />
    </button>
  );
}
