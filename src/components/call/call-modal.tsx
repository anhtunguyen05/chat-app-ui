"use client";

import React, { useEffect, useRef, useState } from "react";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { socket } from "@/lib/socket";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { useCallControls } from "@/hooks/useCallControls";
import CallDuration from "./call-duration";
import CallControls from "./call-controls";
import VideoDisplay from "./video-display";

interface CallModalProps {
  caller: {
    from: string;
    to?: string;
    conversationId: string;
    callType: "voice" | "video";
    callerName?: string;
    callerAvatar?: string;
    offer?: RTCSessionDescriptionInit;
  };
  onAccept: () => void;
  onReject: () => void;
}

export default function CallModal({ caller, onAccept, onReject }: CallModalProps) {
  const [callStatus, setCallStatus] = useState<"incoming" | "connecting" | "connected">("incoming");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const remotePeerId = caller.from || caller.to || "";

  const { isMuted, isVideoOff, toggleMute, toggleVideo, setLocalStream } = useCallControls({
    callType: caller.callType,
    remotePeerId,
  });

  const {
    localStream,
    createOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    cleanup,
  } = usePeerConnection({
    callType: caller.callType,
    conversationId: caller.conversationId,
    remotePeerId,
    onRemoteStream: (stream) => {
      console.log("📥 Setting remote stream");
      setRemoteStream(stream);

      // Always use audio element for audio playback
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().then(() => {
          console.log("🔊 Remote audio is playing");
        }).catch(err => {
          console.error("❌ Error playing remote audio:", err);
        });
      }
    },
    onConnectionStateChange: (state) => {
      if (state === "connected") {
        setCallStatus("connected");
      }
    },
  });

  useEffect(() => {
    // Socket event listeners
    socket.on("call:accepted", (data: { answer: RTCSessionDescriptionInit }) => {
      console.log("📞 Call accepted");
      setCallStatus("connecting");
      handleAnswer(data.answer);
    });

    socket.on("call:ice-candidate", (data: { candidate: RTCIceCandidateInit }) => {
      handleIceCandidate(data.candidate);
    });

    socket.on("call:ended", () => {
      cleanup();
      onReject();
    });

    socket.on("call:rejected", () => {
      alert("Cuộc gọi bị từ chối");
      cleanup();
      onReject();
    });

    socket.on("call:video-toggled", (data: { enabled: boolean }) => {
      console.log("Remote video toggled:", data.enabled);
    });

    socket.on("call:audio-toggled", (data: { enabled: boolean }) => {
      console.log("Remote audio toggled:", data.enabled);
    });

    // Initialize call if caller (no offer means we're initiating)
    if (!caller.offer) {
      console.log("📞 I am the caller, initializing peer connection...");
      setCallStatus("connecting");
      initializeCaller();
    }

    return () => {
      socket.off("call:accepted");
      socket.off("call:ice-candidate");
      socket.off("call:ended");
      socket.off("call:rejected");
      socket.off("call:video-toggled");
      socket.off("call:audio-toggled");
      cleanup();
    };
  }, []);

  const initializeCaller = async () => {
    try {
      const stream = await createOffer();
      setLocalStream(stream);
    } catch (error) {
      console.error("❌ Error initializing caller:", error);
      alert("Không thể truy cập camera/microphone");
      onReject();
    }
  };

  const handleAcceptCall = async () => {
    console.log("📞 Accepting call...");
    setCallStatus("connecting");
    
    try {
      const stream = await createAnswer(caller.offer!);
      setLocalStream(stream);
      setCallStatus("connected");
      onAccept();
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      alert("Không thể truy cập camera/microphone");
      onReject();
    }
  };

  const handleEndCall = () => {
    socket.emit("call:end", {
      to: remotePeerId,
      conversationId: caller.conversationId,
    });
    cleanup();
    onReject();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Hidden audio element for remote audio */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
      
      <div className="relative w-full max-w-4xl h-[600px] bg-gradient-to-br from-violet-900 to-purple-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Video Display */}
        <VideoDisplay
          localStream={localStream.current}
          remoteStream={remoteStream}
          callType={caller.callType}
          isConnected={callStatus === "connected"}
        />

        {/* Voice Call or Incoming Call UI */}
        {(caller.callType === "voice" || callStatus !== "connected") && (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <UserAvatar
              src={caller.callerAvatar}
              className="w-32 h-32 mb-6 ring-4 ring-white/30"
            />
            <h2 className="text-3xl font-bold text-white mb-2">
              {caller.callerName || "Unknown"}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {callStatus === "incoming" && (
                <>
                  {caller.callType === "video" ? "Cuộc gọi video" : "Cuộc gọi thoại"} đến...
                </>
              )}
              {callStatus === "connecting" && "Đang kết nối..."}
              {callStatus === "connected" && "Đang trong cuộc gọi"}
            </p>

            {/* Call Duration */}
            {callStatus === "connected" && <CallDuration />}
          </div>
        )}

        {/* Control Buttons */}
        <CallControls
          callStatus={callStatus}
          callType={caller.callType}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onAccept={handleAcceptCall}
          onReject={onReject}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onEndCall={handleEndCall}
        />
      </div>
    </div>
  );
}
