import { useRef, useEffect } from "react";

interface VideoDisplayProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: "voice" | "video";
  isConnected: boolean;
}

export default function VideoDisplay({
  localStream,
  remoteStream,
  callType,
  isConnected,
}: VideoDisplayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream && callType === "video") {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) =>
        console.error("❌ Error playing local video:", err)
      );
    }
  }, [localStream, callType]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && callType === "video") {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) =>
        console.error("❌ Error playing remote video:", err)
      );
    }
  }, [remoteStream, callType]);

  if (callType !== "video" || !isConnected) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      {/* Remote Video (Full Screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
