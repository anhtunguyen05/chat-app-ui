"use client";

import {
  House,
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
  Ellipsis,
  SquarePen,
} from "lucide-react";

export const Icons = {
  house: House,
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
  ellipsis: Ellipsis,
  squarePen: SquarePen,
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
    <div
      className={`flex items-center justify-center
                  rounded-full bg-gray-200 dark:bg-neutral-800 hover:bg-neutral-300
                  transition-colors ${buttonClassName ?? "w-10 h-10"}`}
    >
      <LucideIcon size={size} className={className} {...iconProps} />
    </div>
  );
}
