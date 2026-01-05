import { useState, useCallback, useRef } from "react";
import { socket } from "@/lib/socket";
import { CallType, CallSocketEvent } from "@/constants/socket-events";

interface UseCallControlsProps {
  callType: CallType;
  remotePeerId: string;
  onCallTypeChange?: (newType: CallType) => void;
  onAddVideoTrack?: () => Promise<MediaStreamTrack>;
  onRemoveVideoTrack?: () => void;
}

export function useCallControls({ 
  callType, 
  remotePeerId, 
  onCallTypeChange,
  onAddVideoTrack,
  onRemoveVideoTrack 
}: UseCallControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === CallType.VOICE); // Voice call → camera off by default
  const [currentCallType, setCurrentCallType] = useState<CallType>(callType);
  const localStreamRef = useRef<MediaStream | null>(null);
  const hasCleanedUp = useRef(false);

  const setLocalStream = useCallback((stream: MediaStream | null) => {
    localStreamRef.current = stream;
    hasCleanedUp.current = false;
  }, []);

  const cleanup = useCallback(() => {
    if (hasCleanedUp.current) return;
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (track.readyState !== 'ended') {
          try {
            track.stop();
            localStreamRef.current?.removeTrack(track);
          } catch (error) {
            console.error(`Error stopping ${track.kind} track:`, error);
          }
        }
      });
      localStreamRef.current = null;
    }
    
    hasCleanedUp.current = true;
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);

        socket.emit(CallSocketEvent.TOGGLE_AUDIO, {
          to: remotePeerId,
          enabled: audioTrack.enabled,
        });
      }
    }
  }, [remotePeerId]);

  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    
    // Case 1: Video call - toggle existing video track
    if (currentCallType === CallType.VIDEO && videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);

      socket.emit(CallSocketEvent.TOGGLE_VIDEO, {
        to: remotePeerId,
        enabled: videoTrack.enabled,
      });
    }
    // Case 2: Voice call - upgrade to video
    else if (currentCallType === CallType.VOICE && !videoTrack && onAddVideoTrack) {
      try {
        await onAddVideoTrack();
        setCurrentCallType(CallType.VIDEO);
        setIsVideoOff(false);
        
        if (onCallTypeChange) {
          onCallTypeChange(CallType.VIDEO);
        }

        socket.emit(CallSocketEvent.TOGGLE_VIDEO, {
          to: remotePeerId,
          enabled: true,
        });
      } catch (error) {
        console.error("Error upgrading to video:", error);
        alert("Không thể mở camera");
      }
    }
  }, [currentCallType, remotePeerId, onAddVideoTrack, onCallTypeChange]);

  return {
    isMuted,
    isVideoOff,
    currentCallType,
    toggleMute,
    toggleVideo,
    setLocalStream,
    cleanup,
  };
}
