import { useState, useCallback, useRef } from "react";
import { socket } from "@/lib/socket";

interface UseCallControlsProps {
  callType: "voice" | "video";
  remotePeerId: string;
}

export function useCallControls({ callType, remotePeerId }: UseCallControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);

  const setLocalStream = useCallback((stream: MediaStream | null) => {
    localStreamRef.current = stream;
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);

        socket.emit("call:toggle-audio", {
          to: remotePeerId,
          enabled: audioTrack.enabled,
        });
      }
    }
  }, [remotePeerId]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current && callType === "video") {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);

        socket.emit("call:toggle-video", {
          to: remotePeerId,
          enabled: videoTrack.enabled,
        });
      }
    }
  }, [callType, remotePeerId]);

  return {
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    setLocalStream,
  };
}
