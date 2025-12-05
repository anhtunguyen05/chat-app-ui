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

export default function SocketProvider() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    if (user?.id) {
      socket.emit("join", { userId: user.id });
      socket.emit("userOnline", user?.id);
      console.log("✅ Joined room:", user.id);
    }

    const fetchPending = async () => {
      const res = await fetchPendingMessages();
      res.forEach((msg) => dispatch(addPendingMessageRequest(msg)));
    };

    fetchPending();

    // Lắng nghe tin nhắn đến
    socket.on("receiveMessage", (message) => {
      dispatch(addMessageRequest(message));
      dispatch(
        addOrUpdateConversationRequest({
          message,
          currentUserId: user?.id || null,
        })
      );
    });

    // Tin nhắn gửi thành công
    socket.on("messageSent", (message) => {
      dispatch(addMessageRequest(message));
      dispatch(
        addOrUpdateConversationRequest({
          message,
          currentUserId: user?.id || null,
        })
      );
    });

    socket.on("onlineList", (list: string[]) => {
      dispatch(setOnlineListRequest(list));
    });

    // Nhận cuộc gọi đến
    socket.on("call:incoming", (data) => {
      console.log("📥 Incoming call:", data);
      // Show modal in main window first
      setIncomingCall(data);
    });

    // Cuộc gọi bị từ chối
    socket.on("call:rejected", (data) => {
      console.log("❌ Call rejected:", data);
      setIncomingCall(null);
      alert("Cuộc gọi bị từ chối");
      closeCallWindow();
    });

    // Cuộc gọi được chấp nhận - forward đến CallModal
    socket.on("call:accepted", (data) => {
      console.log("✅ Call accepted (forwarding to modal):", data);
      // Event này sẽ được CallModal lắng nghe trong popup window
    });

    // Cuộc gọi kết thúc
    socket.on("call:ended", (data) => {
      console.log("📞 Call ended:", data);
      setIncomingCall(null);
      closeCallWindow();
    });

    // Cleanup khi unmount
    return () => {
      socket.off("receiveMessage");
      socket.off("messageSent");
      socket.off("userStatus");
      socket.off("onlineList");
      socket.off("call:incoming");
      socket.off("call:rejected");
      socket.off("call:accepted");
      socket.off("call:ended");
    };
  }, [user, dispatch]);

  // Expose function để initiate call từ bên ngoài
  useEffect(() => {
    (window as any).initiateCall = (callData: any) => {
      console.log("📤 Initiating call:", callData);
      if (!isCallWindowOpen()) {
        openCallWindow(callData);
      } else {
        alert("Bạn đang trong cuộc gọi khác");
      }
    };

    return () => {
      delete (window as any).initiateCall;
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
    socket.emit("call:reject", {
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
