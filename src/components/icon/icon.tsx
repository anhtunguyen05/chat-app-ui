"use client";


import { twMerge } from "tailwind-merge";
import clsx from "clsx";
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
  Camera,
  CameraOff,
  MessageCircle,
  Phone,
  Video,
  Info,
  Mic,
  MicOff,
  Image,
  Sticker,
  ThumbsUp,
  Smile,
  Type,
  Send,
  CirclePlus,
  CircleUserRound,
  PhoneIncoming
} from "lucide-react";
import { send } from "process";

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
  camera: Camera,
  cameraOff: CameraOff,
  messageCircle: MessageCircle,
  phone: Phone,
  video: Video,
  info: Info,
  mic: Mic,
  micOff: MicOff,
  image: Image,
  sticker: Sticker,
  thumbsUp: ThumbsUp,
  smile: Smile,
  type: Type,
  send: Send,
  circlePlus: CirclePlus,
  circleUserRound: CircleUserRound,
  phoneIncoming: PhoneIncoming,
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
      className={twMerge(
        clsx(
          "flex items-center justify-center rounded-full transition-colors",
          "bg-gray-200 dark:bg-neutral-800 hover:bg-neutral-300",
          buttonClassName
        )
      )}
    >
      <LucideIcon size={size} className={className} {...iconProps} />
    </div>
  );
}
