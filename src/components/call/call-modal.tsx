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

  const { isMuted, isVideoOff, toggleMute, toggleVideo, setLocalStream, cleanup: cleanupControls } = useCallControls({
    callType: actualCallType,
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
      // Prevent setting the same stream multiple times (ontrack fires per track)
      if (remoteStreamSet.current) {
        console.log("⏭️ Remote stream already set, skipping");
        return;
      }
      
      console.log("📥 Setting remote stream", {
        streamId: stream.id,
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted
        })),
        audioRefExists: !!remoteAudioRef.current
      });
      
      remoteStreamSet.current = true;
      setRemoteStream(stream);

      // Wait a bit for audio element to be ready
      setTimeout(() => {
        if (remoteAudioRef.current && remoteAudioRef.current.srcObject !== stream) {
          console.log("🔊 Setting remote audio srcObject");
          remoteAudioRef.current.srcObject = stream;
          remoteAudioRef.current.volume = 1.0;
          remoteAudioRef.current.muted = false;
          
          // Play will be handled by autoPlay attribute
          console.log("🔊 Remote audio srcObject set, autoPlay will handle playback");
        }
      }, 100);
    },
    onConnectionStateChange: (state) => {
      if (state === "connected") {
        setCallStatus("connected");
      }
    },
    onCallTypeChange: (newType) => {
      console.log("📢 My call type changed to:", newType);
      setActualCallType(newType);
    },
  });

  useEffect(() => {
    // Socket event listeners
    socket.on("call:accepted", (data: { answer: RTCSessionDescriptionInit; actualCallType?: "voice" | "video" }) => {
      console.log("📞 Call accepted", data);
      setCallStatus("connecting");
      
      // Update remote call type if provided
      if (data.actualCallType) {
        console.log("📢 Remote peer is using:", data.actualCallType);
        setRemoteCallType(data.actualCallType);
      }
      
      handleAnswer(data.answer);
    });

    socket.on("call:ice-candidate", (data: { candidate: RTCIceCandidateInit }) => {
      handleIceCandidate(data.candidate);
    });

    socket.on("call:ended", () => {
      console.log("📞 Call ended by remote, cleaning up...");
      hasEndedCall.current = true;
      remoteStreamSet.current = false; // Reset flag
      
      // Clear local stream state FIRST
      setLocalStreamState(null);
      
      setTimeout(() => {
        // Cleanup remote stream
        if (remoteStream) {
          console.log("🛑 Stopping remote stream tracks");
          remoteStream.getTracks().forEach(track => {
            if (track.readyState !== 'ended') {
              console.log(`🛑 Stopping remote ${track.kind} track`);
              track.stop();
              remoteStream.removeTrack(track);
            }
          });
          setRemoteStream(null);
        }
        
        // Clear audio element
        if (remoteAudioRef.current) {
          console.log("🛑 Clearing remote audio element");
          remoteAudioRef.current.srcObject = null;
        }
        
        cleanupControls();
        cleanup();
        onReject();
      }, 200);
    });

    socket.on("call:rejected", () => {
      console.log("📞 Call rejected, cleaning up...");
      hasEndedCall.current = true;
      remoteStreamSet.current = false; // Reset flag
      
      // Clear local stream state FIRST
      setLocalStreamState(null);
      
      setTimeout(() => {
        // Cleanup remote stream
        if (remoteStream) {
          console.log("🛑 Stopping remote stream tracks");
          remoteStream.getTracks().forEach(track => {
            if (track.readyState !== 'ended') {
              console.log(`🛑 Stopping remote ${track.kind} track`);
              track.stop();
              remoteStream.removeTrack(track);
            }
          });
          setRemoteStream(null);
        }
        
        // Clear audio element
        if (remoteAudioRef.current) {
          console.log("🛑 Clearing remote audio element");
          remoteAudioRef.current.srcObject = null;
        }
        
        // Only show alert if call was rejected before connecting (incoming call)
        if (callStatus === "incoming" || callStatus === "connecting") {
          alert("Cuộc gọi bị từ chối");
        }
        
        cleanupControls();
        cleanup();
        onReject();
      }, 200);
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
    } else {
      console.log("📞 I am the receiver with offer, auto-accepting...");
      // Receiver already accepted in main window modal, auto-accept here
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
      console.log("🧹 Component unmounting, cleaning up streams...");
      
      // Cleanup remote stream
      if (remoteStream) {
        console.log("🛑 Stopping remote stream tracks");
        remoteStream.getTracks().forEach(track => {
          if (track.readyState !== 'ended') {
            console.log(`🛑 Stopping remote ${track.kind} track`);
            track.stop();
            remoteStream.removeTrack(track);
          }
        });
      }
      
      // Clear audio element
      if (remoteAudioRef.current) {
        console.log("🛑 Clearing remote audio element");
        remoteAudioRef.current.srcObject = null;
      }
      
      // IMPORTANT: Cleanup controls first to stop local tracks
      cleanupControls();
      cleanup();
      
      // KHÔNG emit call:end ở đây vì đã được xử lý trong handleEndCall hoặc nhận từ socket
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
    console.log("📞 Accepting call...");
    console.log("🔍 Caller offer:", {
      hasOffer: !!caller.offer,
      offerType: caller.offer?.type,
      callType: caller.callType
    });
    setCallStatus("connecting");
    
    try {
      console.log("🎥 Calling createAnswer...");
      const stream = await createAnswer(caller.offer!, caller.callType);
      console.log("✅ createAnswer successful, stream:", {
        id: stream.id,
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState
        }))
      });
      setLocalStream(stream);
      setLocalStreamState(stream);
      setCallStatus("connected");
      onAccept();
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      alert("Không thể truy cập camera/microphone");
      onReject();
    }
  };

  const handleEndCall = () => {
    if (hasEndedCall.current) {
      console.log("⚠️ Call already ended, skipping...");
      return;
    }
    
    console.log("📞 Ending call...");
    hasEndedCall.current = true;
    
    // CRITICAL: Clear local stream state FIRST to unmount VideoDisplay
    console.log("📝 Clearing local stream state to unmount video");
    setLocalStreamState(null);
    
    // Give VideoDisplay time to clear srcObject and stop tracks
    setTimeout(() => {
      // Cleanup remote stream
      if (remoteStream) {
        console.log("🛑 Stopping remote stream tracks");
        remoteStream.getTracks().forEach(track => {
          if (track.readyState !== 'ended') {
            console.log(`🛑 Stopping remote ${track.kind} track`);
            track.stop();
            remoteStream.removeTrack(track);
          }
        });
        setRemoteStream(null);
      }
      
      // Clear audio element
      if (remoteAudioRef.current) {
        console.log("🛑 Clearing remote audio element");
        remoteAudioRef.current.srcObject = null;
      }
      
      // IMPORTANT: Cleanup controls first to stop local tracks
      console.log("🧹 Cleaning up controls (stops local tracks)");
      cleanupControls();
      
      // Then cleanup peer connection
      console.log("🧹 Cleaning up peer connection");
      cleanup();
      
      socket.emit("call:end", {
        to: remotePeerId,
        conversationId: caller.conversationId,
      });
      
      onReject();
    }, 200); // Increased delay to let browser release devices
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
        onLoadedMetadata={() => console.log("🎵 Remote audio metadata loaded")}
        onPlay={() => console.log("▶️ Remote audio playing")}
        onError={(e) => console.error("❌ Remote audio error:", e)}
      />
      
      <div className="relative w-full max-w-4xl h-[600px] bg-transparent from-violet-900 to-purple-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Video Display */}
        <VideoDisplay
          localStream={localStreamState}
          remoteStream={remoteStream}
          callType={actualCallType}
          isConnected={callStatus === "connected"}
        />

        {/* Voice Call or Incoming Call UI */}
        {((actualCallType === "voice" && remoteCallType === "voice") || callStatus !== "connected") && (
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
              {callStatus === "connecting" && "\u0110ang k\u1ebft n\u1ed1i..."}
              {callStatus === "connected" && (
                <>
                  \u0110ang trong cu\u1ed9c g\u1ecdi
                  {actualCallType !== caller.callType && (
                    <span className="block text-sm text-yellow-300 mt-2">
                      (Đang dùng {actualCallType === "voice" ? "thoại" : "video"})
                    </span>
                  )}
                  {actualCallType === "video" && remoteCallType === "voice" && (
                    <span className="block text-sm text-yellow-300 mt-2">
                      (\u0110\u1ed1i ph\u01b0\u01a1ng ch\u1ec9 d\u00f9ng tho\u1ea1i)
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
          callType={actualCallType}
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
