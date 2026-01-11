import React from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Icon } from "@/components/icon/icon";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { Conversation } from "@/features/chat/chatType";
import { timeFormat } from "@/utils/formatter";
import { CallType } from "@/constants/socket-events";
import { CallData } from "@/types/call";


interface HeaderChatProps {
  selectedConversation: Conversation;
  onInfoClick: () => void;
}

export default function HeaderChat({
  selectedConversation,
  onInfoClick,
}: HeaderChatProps) {
  const isOnline = useAppSelector((state) =>
    state.chat.onlineList.includes(selectedConversation.id)
  );
  const currentUser = useAppSelector((state) => state.user.user);
  const participants = useAppSelector((state) => state.chat.participants);

  // Lấy participant của người nhận (không phải current user) cho call 1-1
  const getReceiverParticipantId = () => {
    if (selectedConversation.type === "private") {
      const receiver = participants.find((p) => p.id !== currentUser?.id);
      return receiver?.id || selectedConversation.id;
    }
    return selectedConversation.id;
  };

  const handleVoiceCall = async () => {
    // if (!isOnline) {
    //   alert("Người dùng không online");
    //   return;
    // }

    try {
      const receiverParticipantId = getReceiverParticipantId();

      console.log("📤 Initiating voice call", {
        receiverParticipantId,
      });

      // Hiển thị modal cho người gọi - modal sẽ tạo peer connection
      const windowWithInitiateCall = window as Window & { initiateCall?: (callData: CallData) => void };
      if (windowWithInitiateCall.initiateCall) {
        windowWithInitiateCall.initiateCall({
          from: currentUser?.id || "",
          to: receiverParticipantId,
          conversationId: selectedConversation.id,
          callType: CallType.VOICE,
          callerName: selectedConversation.name,
          callerAvatar: selectedConversation.avatar,
        });
      }
    } catch (error) {
      console.error("Error initiating voice call:", error);
      alert("Không thể bắt đầu cuộc gọi");
    }
  };

  const handleVideoCall = async () => {
    // if (!isOnline) {
    //   alert("Người dùng không online");
    //   return;
    // }

    try {
      const receiverParticipantId = getReceiverParticipantId();

      console.log("📤 Initiating video call", {
        receiverParticipantId,
      });

      // Hiển thị modal cho người gọi - modal sẽ tạo peer connection
      const windowWithInitiateCall = window as Window & { initiateCall?: (callData: CallData) => void };
      if (windowWithInitiateCall.initiateCall) {
        windowWithInitiateCall.initiateCall({
          from: currentUser?.id || "",
          to: receiverParticipantId,
          conversationId: selectedConversation.id,
          callType: CallType.VIDEO,
          callerName: selectedConversation.name,
          callerAvatar: selectedConversation.avatar,
        });
      }
    } catch (error) {
      console.error("Error initiating video call:", error);
      alert("Không thể bắt đầu cuộc gọi");
    }
  };

  const formatLastSeen = (time: Date) => {
    if (!time) return "";
    const offTime = timeFormat(time);
    return `Hoạt động ${offTime}`;
  };

  return (
    <div className="flex w-full h-16 items-center justify-between px-4 py-2 rounded-t-lg shadow-sm bg-white dark:bg-neutral-900">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3">
        <UserAvatar src={selectedConversation?.avatar}></UserAvatar>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-xl md:text-xl text-neutral-900 dark:text-white">
            {selectedConversation.name}
          </span>
          <p className="text-sm text-gray-500">
            {isOnline && selectedConversation.type === "private"
              ? "Đang hoạt động"
              : formatLastSeen(selectedConversation.lastSeen as Date)}
          </p>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-4">
        <Icon
          name="phone"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
          onClick={handleVoiceCall}
        ></Icon>
        <Icon
          name="video"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
          onClick={handleVideoCall}
        ></Icon>
        <Icon
          name="info"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
          onClick={onInfoClick}
        ></Icon>
      </div>
    </div>
  );
}
