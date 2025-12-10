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
  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
  const [actualCallType, setActualCallType] = useState<"voice" | "video">(caller.callType);
  const [remoteCallType, setRemoteCallType] = useState<"voice" | "video">(caller.callType);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const remotePeerId = caller.from || caller.to || "";
  const hasEndedCall = useRef(false); // Flag để tránh emit call:end nhiều lần
  const remoteStreamSet = useRef(false); // Flag để tránh set remote stream nhiều lần
  const remoteStreamRef = useRef<MediaStream | null>(null); // Track remote stream for comparison

  const {
    localStream,
    createOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    addVideoTrack,
    removeVideoTrack,
    handleRenegotiation,
    handleRenegotiationAnswer,
    cleanup,
  } = usePeerConnection({
    callType: caller.callType,
    conversationId: caller.conversationId,
    remotePeerId,
    onRemoteStream: (stream) => {
      const hasVideo = stream.getVideoTracks().length > 0;
      const hasAudio = stream.getAudioTracks().length > 0;
      const videoEnabled = stream.getVideoTracks()[0]?.enabled;
      
      console.log("📡 onRemoteStream called:", {
        hasVideo,
        hasAudio,
        videoEnabled,
        isFirstTime: !remoteStreamSet.current
      });
      
      // Check if track composition actually changed
      const prevStream = remoteStreamRef.current;
      const hasChanged = !prevStream || 
        prevStream.getVideoTracks().length !== stream.getVideoTracks().length ||
        prevStream.getAudioTracks().length !== stream.getAudioTracks().length;
      
      if (hasChanged) {
        console.log("🔄 Stream tracks changed, updating...");
        // Create new MediaStream to force re-render when tracks change
        const newStream = new MediaStream(stream.getTracks());
        remoteStreamRef.current = newStream;
        setRemoteStream(newStream);
        
        setTimeout(() => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = newStream;
            remoteAudioRef.current.volume = 1.0;
            remoteAudioRef.current.muted = false;
          }
        }, 100);
      }
      
      if (!remoteStreamSet.current) {
        remoteStreamSet.current = true;
      }
    },
    onConnectionStateChange: (state) => {
      if (state === "connected") setCallStatus("connected");
    },
    onCallTypeChange: (newType) => {
      setActualCallType(newType);
    },
  });

  const { isMuted, isVideoOff, currentCallType, toggleMute, toggleVideo, setLocalStream, cleanup: cleanupControls } = useCallControls({
    callType: actualCallType,
    remotePeerId,
    onCallTypeChange: (newType) => {
      setActualCallType(newType);
    },
    onAddVideoTrack: async () => {
      const videoTrack = await addVideoTrack();
      // Update local stream state to trigger re-render
      if (localStream.current) {
        const newStream = new MediaStream(localStream.current.getTracks());
        console.log("📹 Updated local stream tracks:", {
          video: newStream.getVideoTracks().length,
          audio: newStream.getAudioTracks().length,
          videoEnabled: newStream.getVideoTracks()[0]?.enabled
        });
        setLocalStreamState(newStream);
      }
      return videoTrack;
    },
    onRemoveVideoTrack: () => {
      removeVideoTrack();
      if (localStream.current) {
        setLocalStreamState(new MediaStream(localStream.current.getTracks()));
      }
    },
  });

  const cleanupStreams = () => {
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => {
        if (track.readyState !== 'ended') {
          track.stop();
          remoteStream.removeTrack(track);
        }
      });
      setRemoteStream(null);
    }
    
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    
    remoteStreamRef.current = null;
    cleanupControls();
    cleanup();
  };

  useEffect(() => {
    // Socket event listeners
    socket.on("call:accepted", (data: { answer: RTCSessionDescriptionInit; actualCallType?: "voice" | "video" }) => {
      setCallStatus("connecting");
      if (data.actualCallType) setRemoteCallType(data.actualCallType);
      handleAnswer(data.answer);
    });

    socket.on("call:ice-candidate", (data: { candidate: RTCIceCandidateInit }) => {
      handleIceCandidate(data.candidate);
    });

    socket.on("call:ended", () => {
      hasEndedCall.current = true;
      remoteStreamSet.current = false;
      setLocalStreamState(null);
      
      setTimeout(() => {
        cleanupStreams();
        onReject();
      }, 200);
    });

    socket.on("call:rejected", () => {
      hasEndedCall.current = true;
      remoteStreamSet.current = false;
      setLocalStreamState(null);
      
      setTimeout(() => {
        cleanupStreams();
        if (callStatus === "incoming" || callStatus === "connecting") {
          alert("Cuộc gọi bị từ chối");
        }
        onReject();
      }, 200);
    });

    socket.on("call:video-toggled", () => {});
    socket.on("call:audio-toggled", () => {});

    socket.on("call:upgrade-request", (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      // Peer wants to upgrade to video
      console.log("📹 Received upgrade request from peer");
      setRemoteCallType("video");
      handleRenegotiation(data.offer);
    });

    socket.on("call:upgrade-accepted", (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      // Peer accepted our upgrade request
      console.log("✅ Peer accepted upgrade request");
      handleRenegotiationAnswer(data.answer);
    });

    if (!caller.offer) {
      setCallStatus("connecting");
      initializeCaller();
    } else {
      setCallStatus("connecting");
      handleAcceptCall();
    }

    return () => {
      socket.off("call:accepted");
      socket.off("call:ice-candidate");
      socket.off("call:ended");
      socket.off("call:rejected");
      socket.off("call:video-toggled");
      socket.off("call:audio-toggled");
      socket.off("call:upgrade-request");
      socket.off("call:upgrade-accepted");
      
      cleanupStreams();
    };
  }, []);

  const initializeCaller = async () => {
    try {
      const stream = await createOffer();
      setLocalStream(stream);
      setLocalStreamState(stream);
    } catch (error) {
      console.error("❌ Error initializing caller:", error);
      alert("Không thể truy cập camera/microphone");
      onReject();
    }
  };

  const handleAcceptCall = async () => {
    setCallStatus("connecting");
    
    try {
      const stream = await createAnswer(caller.offer!, caller.callType);
      setLocalStream(stream);
      setLocalStreamState(stream);
      setCallStatus("connected");
      onAccept();
    } catch (error) {
      console.error("Error accepting call:", error);
      alert("Không thể truy cập camera/microphone");
      onReject();
    }
  };

  const handleEndCall = () => {
    if (hasEndedCall.current) return;
    
    hasEndedCall.current = true;
    setLocalStreamState(null);
    
    setTimeout(() => {
      cleanupStreams();
      
      socket.emit("call:end", {
        to: remotePeerId,
        conversationId: caller.conversationId,
      });
      
      onReject();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Hidden audio element for remote audio - ALWAYS render */}
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline 
        controls={false}
        style={{ display: 'none' }}
      />
      
      <div className="relative w-full max-w-4xl h-[600px] bg-transparent from-violet-900 to-purple-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Video Display */}
        <VideoDisplay
          localStream={localStreamState}
          remoteStream={remoteStream}
          callType={currentCallType}
          isConnected={callStatus === "connected"}
        />

        {/* Voice Call or Incoming Call UI */}
        {((currentCallType === "voice" && remoteCallType === "voice") || callStatus !== "connected") && (
          <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-gray-800 to-gray-900">
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
              {callStatus === "connected" && (
                <>
                  Đang trong cuộc gọi
                  {currentCallType !== caller.callType && (
                    <span className="block text-sm text-yellow-300 mt-2">
                      (Đang dùng {currentCallType === "voice" ? "thoại" : "video"})
                    </span>
                  )}
                  {currentCallType === "video" && remoteCallType === "voice" && (
                    <span className="block text-sm text-yellow-300 mt-2">
                      (Đối phương chỉ dùng thoại)
                    </span>
                  )}
                </>
              )}
            </p>

            {/* Call Duration */}
            {callStatus === "connected" && <CallDuration />}
          </div>
        )}

        {/* Control Buttons */}
        <CallControls
          callStatus={callStatus}
          callType={currentCallType}
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
