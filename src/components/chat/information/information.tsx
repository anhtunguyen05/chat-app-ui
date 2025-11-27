"use client";

import { Conversation } from "@/features/chat/chatType";
import { Icon } from "@/components/icon/icon";
import UserAvatar from "@/components/user-avatar/user-avatar";

interface InformationProps {
  selectedConversation: Conversation;
}

export default function Information({
  selectedConversation,
}: InformationProps) {
  return (
    <div className="w-120 bg-white rounded-md p-4 overflow-y-auto">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 pb-4 border-b">
          <UserAvatar
            src={selectedConversation.avatar}
            alt={selectedConversation.name}
            size={80}
          />
          <h3 className="text-xl font-semibold text-neutral-900">
            {selectedConversation.name}
          </h3>
          <div className="flex items-center gap-10 mt-2">
            <Icon name="circleUserRound" size={23} buttonClassName="w-10 h-10"/>
            <Icon name="bell" size={23} buttonClassName="w-10 h-10"/>
            <Icon name="search" size={23} buttonClassName="w-10 h-10"/>
          </div>
        </div>

        {/* Thông tin đoạn chat */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-neutral-600">
            Thông tin về đoạn chat
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-500">Loại:</span>
              <span className="text-neutral-900 font-medium">
                {selectedConversation.type === "private"
                  ? "Trò chuyện riêng"
                  : "Nhóm"}
              </span>
            </div>
          </div>
        </div>

        {/* Tùy chỉnh đoạn chat */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-semibold text-neutral-600">
            Tùy chỉnh đoạn chat
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-violet-600">🔔</span>
              </div>
              <span className="text-sm text-neutral-700">Tắt thông báo</span>
            </button>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-violet-600">🎨</span>
              </div>
              <span className="text-sm text-neutral-700">Đổi màu sắc</span>
            </button>
          </div>
        </div>

        {/* File phương tiện & File */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-semibold text-neutral-600">
            File phương tiện & file
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-violet-600">🖼️</span>
              </div>
              <span className="text-sm text-neutral-700">File phương tiện</span>
            </button>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-violet-600">📄</span>
              </div>
              <span className="text-sm text-neutral-700">File</span>
            </button>
          </div>
        </div>

        {/* Quyền riêng tư và hỗ trợ */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-semibold text-neutral-600">
            Quyền riêng tư và hỗ trợ
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600">🚫</span>
              </div>
              <span className="text-sm text-neutral-700">Chặn</span>
            </button>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600">⚠️</span>
              </div>
              <span className="text-sm text-neutral-700">Báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
