"use client";

import { memo, use, useState } from "react";
import Image from "next/image";
import { useAppSelector } from "@/hooks/useAppSelector";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  isOnline?: boolean;
  onlineClassName?: string;
}

const defaultAvatar = "/default-avatar.jpg";

function UserAvatar({
  src = defaultAvatar,
  size = 38,
  alt = "avatar",
  className,
  style,
  isOnline = false,
  onlineClassName = "",
}: UserAvatarProps) {
  const [fallback, setFallback] = useState<string>();

  const handleError = () => {
    setFallback(defaultAvatar);
  };

  if (!src) {
    src = defaultAvatar;
  }

  return (
    <div className="relative flex cursor-pointer">
      <Image
        src={fallback || src}
        onError={handleError}
        alt={alt}
        width={size}
        height={size}
        className={`aspect-square flex-shrink-0 cursor-pointer rounded-full object-cover ${className}`}
        priority
        quality={100}
        style={style}
      />
      {/* {isOnline && (
        <div
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark ${onlineClassName}`}
        ></div>
      )} */}
    </div>
  );
}

export default memo(UserAvatar);
