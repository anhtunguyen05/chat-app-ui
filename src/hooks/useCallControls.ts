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
    console.log("🎬 Setting local stream in controls:", stream ? "stream provided" : "clearing stream");
    localStreamRef.current = stream;
  }, []);

  const cleanup = useCallback(() => {
    console.log("🧹 Cleaning up call controls...");
    console.log("🔍 Current localStreamRef:", localStreamRef.current);
    
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks();
      console.log("🛑 Stopping tracks from controls:", tracks.length);
      
      tracks.forEach((track) => {
        console.log(`🛑 Controls stopping ${track.kind} track, readyState: ${track.readyState}`);
        
        try {
          track.stop();
          console.log(`✅ Track ${track.kind} stopped, new readyState: ${track.readyState}`);
          
          // Verify the track actually stopped
          if (track.readyState !== 'ended') {
            console.warn(`⚠️ Track ${track.kind} readyState is still "${track.readyState}", may be held by another source`);
          }
        } catch (error) {
          console.error(`❌ Error stopping ${track.kind} track:`, error);
        }
      });
    } else {
      console.warn("⚠️ localStreamRef is null, cannot stop tracks!");
    }
    
    localStreamRef.current = null;
    console.log("✅ Call controls cleanup complete");
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
    cleanup,
  };
}
