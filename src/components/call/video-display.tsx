import { useRef, useEffect, useState } from "react";
import { CallType } from "@/constants/socket-events";

interface VideoDisplayProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: CallType;
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
  const [hasLocalVideo, setHasLocalVideo] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  useEffect(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const hasVideo = videoTracks.length > 0 && videoTracks[0].enabled;
      setHasLocalVideo(hasVideo);
    } else {
      setHasLocalVideo(false);
    }
  }, [localStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream && hasLocalVideo) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => {
        console.error("Error playing local video:", err);
      });
    }

    return () => {
      if (localVideoRef.current) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        localVideoRef.current.srcObject = null;
        
        if (stream) {
          stream.getTracks().forEach(track => {
            if (track.readyState !== 'ended') track.stop();
          });
        }
      }
    };
  }, [localStream, hasLocalVideo]);

  useEffect(() => {
    if (remoteStream) {
      const videoTracks = remoteStream.getVideoTracks();
      const hasVideo = videoTracks.length > 0 && videoTracks[0].enabled;
      setHasRemoteVideo(hasVideo);
    } else {
      setHasRemoteVideo(false);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && hasRemoteVideo) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => {
        console.error("Error playing remote video:", err);
      });
    }

    return () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [remoteStream, hasRemoteVideo]);
  
  if (!hasLocalVideo && !hasRemoteVideo) {
    return null;
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Remote Video (Full Screen) - hiển thị nếu có */}
      {hasRemoteVideo ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ display: 'block' }}
        />
      ) : hasLocalVideo ? (
        /* Nếu không có remote video, hiển thị placeholder */
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <p className="text-white/60 text-lg">Đối phương chưa bật video</p>
        </div>
      ) : null}

      {/* Local Video (Picture-in-Picture) - hiển thị nếu có */}
      {hasLocalVideo && (
        <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ 
              display: 'block',
              backgroundColor: '#000'
            }}
          />
        </div>
      )}
    </div>
  );
}