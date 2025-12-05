import { useRef, useEffect, useState } from "react";

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
  const [hasLocalVideo, setHasLocalVideo] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  useEffect(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const hasVideo = videoTracks.length > 0 && videoTracks[0].enabled;
      console.log("🎥 Local stream update:", {
        hasVideoTracks: videoTracks.length,
        enabled: videoTracks[0]?.enabled,
        readyState: videoTracks[0]?.readyState,
        muted: videoTracks[0]?.muted,
        hasVideo,
        refExists: !!localVideoRef.current
      });
      setHasLocalVideo(hasVideo);
    } else {
      console.log("⚠️ No local stream");
      setHasLocalVideo(false);
    }
  }, [localStream]);

  // Separate effect to set srcObject when both stream and ref are ready
  useEffect(() => {
    if (localVideoRef.current && localStream && hasLocalVideo) {
      console.log("🎥 Setting local video srcObject (ref is ready)");
      localVideoRef.current.srcObject = localStream;
      
      // Force play
      const playPromise = localVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("✅ Local video playing, dimensions:", {
            videoWidth: localVideoRef.current?.videoWidth,
            videoHeight: localVideoRef.current?.videoHeight,
            readyState: localVideoRef.current?.readyState
          });
        }).catch((err) => {
          console.error("❌ Error playing local video:", err);
        });
      }
    }

    // Cleanup: Clear srcObject when component unmounts or stream changes
    return () => {
      if (localVideoRef.current) {
        console.log("🧹 Clearing local video srcObject");
        const stream = localVideoRef.current.srcObject as MediaStream;
        localVideoRef.current.srcObject = null;
        
        // Immediately stop all tracks after clearing srcObject
        if (stream) {
          console.log("🛑 Stopping tracks immediately after clearing srcObject");
          stream.getTracks().forEach(track => {
            if (track.readyState !== 'ended') {
              console.log(`🛑 VideoDisplay stopping ${track.kind} track`);
              track.stop();
            }
          });
        }
      }
    };
  }, [localStream, hasLocalVideo]); // Remove isConnected dependency

  useEffect(() => {
    if (remoteStream) {
      const videoTracks = remoteStream.getVideoTracks();
      const hasVideo = videoTracks.length > 0 && videoTracks[0].enabled;
      console.log("📺 Remote stream update:", {
        hasVideoTracks: videoTracks.length,
        enabled: videoTracks[0]?.enabled,
        readyState: videoTracks[0]?.readyState,
        hasVideo,
        refExists: !!remoteVideoRef.current
      });
      setHasRemoteVideo(hasVideo);
    } else {
      console.log("⚠️ No remote stream");
      setHasRemoteVideo(false);
    }
  }, [remoteStream]);

  // Separate effect to set srcObject when both stream and ref are ready
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && hasRemoteVideo) {
      console.log("📺 Setting remote video srcObject (ref is ready)");
      remoteVideoRef.current.srcObject = remoteStream;
      
      const playPromise = remoteVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("✅ Remote video playing");
        }).catch((err) => {
          console.error("❌ Error playing remote video:", err);
        });
      }
    }

    // Cleanup: Clear srcObject when component unmounts or stream changes
    return () => {
      if (remoteVideoRef.current) {
        console.log("🧹 Clearing remote video srcObject");
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [remoteStream, hasRemoteVideo]); // Remove isConnected dependency

  // Hiển thị ngay khi có stream (không cần đợi connected)
  console.log("🖼️ VideoDisplay render:", { 
    hasLocalVideo, 
    hasRemoteVideo,
    willRender: hasLocalVideo || hasRemoteVideo
  });
  
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
            onLoadedMetadata={(e) => {
              console.log("📹 Local video metadata loaded:", {
                videoWidth: e.currentTarget.videoWidth,
                videoHeight: e.currentTarget.videoHeight,
                readyState: e.currentTarget.readyState
              });
            }}
            onPlaying={() => console.log("▶️ Local video is playing")}
            onError={(e) => console.error("❌ Local video error:", e)}
          />
        </div>
      )}
    </div>
  );
}
