"use client";

import { useState, ReactNode } from "react";
import { Icon } from "@/components/icon/icon";

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Collapsible({
  title,
  children,
  defaultOpen = false,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between hover:bg-bubble-hover rounded-lg p-4 transition-colors"
      >
        <h4 className="text-md font-semibold text-text">{title}</h4>
        <Icon
          name="chevronDown"
          size={18}
          className={`text-text transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
