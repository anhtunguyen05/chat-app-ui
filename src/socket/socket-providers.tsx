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
import CallModal from "@/components/call/call-modal";

export default function SocketProvider() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [outgoingCall, setOutgoingCall] = useState<any>(null);

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
      setIncomingCall(data);
    });

    // Cuộc gọi bị từ chối
    socket.on("call:rejected", (data) => {
      console.log("❌ Call rejected:", data);
      alert("Cuộc gọi bị từ chối");
      setIncomingCall(null);
      setOutgoingCall(null);
    });

    // Cuộc gọi được chấp nhận - forward đến CallModal
    socket.on("call:accepted", (data) => {
      console.log("✅ Call accepted (forwarding to modal):", data);
      // Event này sẽ được CallModal lắng nghe
    });

    // Cuộc gọi kết thúc
    socket.on("call:ended", (data) => {
      console.log("📞 Call ended:", data);
      setIncomingCall(null);
      setOutgoingCall(null);
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
      setOutgoingCall(callData);
    };

    return () => {
      delete (window as any).initiateCall;
    };
  }, []);

  return (
    <>
      {/* Incoming call modal */}
      {incomingCall && (
        <CallModal
          caller={incomingCall}
          onAccept={() => {
            // Accept sẽ được xử lý trong CallModal
          }}
          onReject={() => {
            socket.emit("call:reject", { 
              to: incomingCall.from,
              conversationId: incomingCall.conversationId,
              reason: "declined"
            });
            setIncomingCall(null);
          }}
        />
      )}

      {/* Outgoing call modal */}
      {outgoingCall && (
        <CallModal
          caller={outgoingCall}
          onAccept={() => {
            // Nút accept không hiển thị cho outgoing call
          }}
          onReject={() => {
            socket.emit("call:end", { 
              to: outgoingCall.to,
              conversationId: outgoingCall.conversationId
            });
            setOutgoingCall(null);
          }}
        />
      )}
    </>
  );
}
