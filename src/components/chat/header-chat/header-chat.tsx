import Image from "next/image";
import { Phone, Video, Info } from "lucide-react";
import { Icon } from "@/components/icon/icon";
import UserAvatar from "@/components/user-avatar/user-avatar";

interface HeaderChatProps {
  name: string;
  status: string;
  avatarUrl?: string;
}

export default function HeaderChat({
  name,
  status,
  avatarUrl,
}: HeaderChatProps) {
  return (
    <div className="flex w-full h-16 items-center justify-between px-4 py-2 shadow-sm bg-white dark:bg-neutral-900">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3">
        <UserAvatar></UserAvatar>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-xl md:text-xl text-neutral-900 dark:text-white">
            {name}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {status}
          </span>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-4">
        <Icon
          name="phone"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        ></Icon>
        <Icon
          name="video"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        ></Icon>
        <Icon
          name="info"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        ></Icon>
      </div>
    </div>
  );
}
