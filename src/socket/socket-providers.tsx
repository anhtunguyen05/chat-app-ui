"use client";
import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  addOrUpdateConversationRequest,
  addMessageRequest,
  setOnlineListRequest,
  addPendingMessageRequest,
} from "@/features/chat/chatSlice";
import { fetchPendingMessages } from "@/services/chatService";
import { openCallWindow, closeCallWindow, isCallWindowOpen } from "@/utils/callWindow";
import IncomingCallModal from "@/components/call/incoming-call-modal";
import { UserSocketEvent, MessageSocketEvent, CallSocketEvent, CallType } from "@/constants/socket-events";
import { Message } from "@/features/chat/chatType";

interface CallData {
  from: string;
  conversationId: string;
  callerName: string;
  callerAvatar: string;
  callType: CallType;
}

export default function SocketProvider() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const selectedConversation = useAppSelector((state) => state.chat.selectedConversation);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);

  useEffect(() => {
    if (!user) return;

    // Expose selectedConversation ID to window for delayed access
    (window as Window & { __selectedConversationId?: string }).__selectedConversationId = selectedConversation?.id;

    if (user?.id) {
      socket.emit(UserSocketEvent.JOIN, { userId: user.id });
      socket.emit(UserSocketEvent.USER_ONLINE, user?.id);
      console.log("✅ Joined room:", user.id);
    }

    const fetchPending = async () => {
      const res = await fetchPendingMessages();
      res.forEach((msg) => dispatch(addPendingMessageRequest(msg)));
    };

    fetchPending();

    // Lắng nghe tin nhắn đến
    socket.on(MessageSocketEvent.RECEIVE_MESSAGE, (message: Message) => {
      dispatch(addMessageRequest(message));
      dispatch(
        addOrUpdateConversationRequest({
          message,
          currentUserId: user?.id || null,
        })
      );
    });

    // Tin nhắn gửi thành công
    socket.on(MessageSocketEvent.MESSAGE_SENT, (message: Message) => {
      dispatch(addMessageRequest(message));
      dispatch(
        addOrUpdateConversationRequest({
          message,
          currentUserId: user?.id || null,
        })
      );
    });

    socket.on(UserSocketEvent.ONLINE_LIST, (list: string[]) => {
      dispatch(setOnlineListRequest(list));
    });

    // Nhận cuộc gọi đến
    socket.on(CallSocketEvent.INCOMING, (data: CallData) => {
      console.log("📥 Incoming call:", data);
      // Show modal in main window first
      setIncomingCall(data);
    });

    // Cuộc gọi bị từ chối
    socket.on(CallSocketEvent.REJECTED, (data) => {
      console.log("❌ Call rejected:", data);
      setIncomingCall(null);
      alert("Cuộc gọi bị từ chối");
      closeCallWindow();
    });

    // Cuộc gọi được chấp nhận - forward đến CallModal
    socket.on(CallSocketEvent.ACCEPTED, (data) => {
      console.log("✅ Call accepted (forwarding to modal):", data);
      // Event này sẽ được CallModal lắng nghe trong popup window
    });

    // Cuộc gọi kết thúc
    socket.on(CallSocketEvent.ENDED, (data) => {
      console.log("📞 Call ended:", data);
      setIncomingCall(null);
      closeCallWindow();
    });

    // Cleanup khi unmount
    return () => {
      socket.off(MessageSocketEvent.RECEIVE_MESSAGE);
      socket.off(MessageSocketEvent.MESSAGE_SENT);
      socket.off(UserSocketEvent.USER_STATUS);
      socket.off(UserSocketEvent.ONLINE_LIST);
      socket.off(CallSocketEvent.INCOMING);
      socket.off(CallSocketEvent.REJECTED);
      socket.off(CallSocketEvent.ACCEPTED);
      socket.off(CallSocketEvent.ENDED);
    };
  }, [user, dispatch, selectedConversation]);

  // Expose function để initiate call từ bên ngoài
  useEffect(() => {
    (window as Window & { initiateCall?: (callData: CallData) => void }).initiateCall = (callData: CallData) => {
      console.log("📤 Initiating call:", callData);
      if (!isCallWindowOpen()) {
        openCallWindow(callData);
      } else {
        alert("Bạn đang trong cuộc gọi khác");
      }
    };

    return () => {
      delete (window as Window & { initiateCall?: (callData: CallData) => void }).initiateCall;
    };
  }, []);

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    
    console.log("✅ Accepting incoming call");
    if (!isCallWindowOpen()) {
      openCallWindow(incomingCall);
      setIncomingCall(null); // Close modal
    } else {
      alert("Bạn đang trong cuộc gọi khác");
    }
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    
    console.log("❌ Rejecting incoming call");
    socket.emit(CallSocketEvent.REJECT, {
      to: incomingCall.from,
      conversationId: incomingCall.conversationId,
    });
    setIncomingCall(null);
  };

  return (
    <>
      {incomingCall && (
        <IncomingCallModal
          caller={{
            callerName: incomingCall.callerName,
            callerAvatar: incomingCall.callerAvatar,
            callType: incomingCall.callType,
          }}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    </>
  );
}
