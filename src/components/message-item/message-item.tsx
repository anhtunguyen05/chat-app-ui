import React from "react";

interface MessageItemProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function MessageItem({
  children,
  active,
  onClick,
  className,
}: MessageItemProps) {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-1 rounded-full font-medium transition-colors
${
  active
    ? "bg-blue-50 text-blue-600"
    : "bg-gray-100 text-black hover:bg-gray-200"
}
${className ?? ""}`}
    >
      {children}
    </div>
  );
}
