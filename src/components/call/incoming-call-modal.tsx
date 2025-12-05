"use client";

import React from "react";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { Icon } from "@/components/icon/icon";

interface IncomingCallModalProps {
  caller: {
    callerName?: string;
    callerAvatar?: string;
    callType: "voice" | "video";
  };
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({ caller, onAccept, onReject }: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <UserAvatar
            src={caller.callerAvatar}
            className="w-32 h-32 mb-6 ring-4 ring-white/30"
          />
          <h2 className="text-3xl font-bold text-white mb-2">
            {caller.callerName || "Unknown"}
          </h2>
          <p className="text-white/80 text-lg mb-8">
            {caller.callType === "video" ? "Cuộc gọi video" : "Cuộc gọi thoại"} đến...
          </p>

          {/* Accept/Reject Buttons */}
          <div className="flex items-center gap-6">
            {/* Reject Button */}
            <button
              onClick={onReject}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg">
                <Icon name="phone" className="w-8 h-8 text-white rotate-[135deg]" />
              </div>
              <span className="text-white/80 text-sm">Từ chối</span>
            </button>

            {/* Accept Button */}
            <button
              onClick={onAccept}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg">
                <Icon name="phone" className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/80 text-sm">Chấp nhận</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
