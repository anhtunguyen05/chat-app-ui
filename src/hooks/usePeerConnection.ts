import { useRef, useCallback } from "react";
import { socket } from "@/lib/socket";

interface UsePeerConnectionProps {
  callType: "voice" | "video";
  conversationId: string;
  remotePeerId: string;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onCallTypeChange?: (actualType: "voice" | "video") => void;
}

export function usePeerConnection({
  callType,
  conversationId,
  remotePeerId,
  onRemoteStream,
  onConnectionStateChange,
  onCallTypeChange,
}: UsePeerConnectionProps) {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const hasCleanedUp = useRef(false);

  const handleRemoteTrack = useCallback(
    (event: RTCTrackEvent) => {
      console.log("📥 Received remote track:", {
        kind: event.track.kind,
        enabled: event.track.enabled,
        readyState: event.track.readyState,
        muted: event.track.muted,
        streamId: event.streams[0]?.id,
        streamActive: event.streams[0]?.active
      });
      
      if (event.streams[0]) {
        console.log("📥 Remote stream tracks:", event.streams[0].getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState
        })));
        onRemoteStream(event.streams[0]);
      } else {
        console.error("❌ No stream in track event!");
      }
    },
    [onRemoteStream]
  );

  const handleIceConnectionStateChange = useCallback(() => {
    console.log("🧊 ICE connection state:", peerConnection.current?.iceConnectionState);
  }, []);

  const handleConnectionStateChange = useCallback(() => {
    const state = peerConnection.current?.connectionState;
    console.log("🔌 Connection state:", state);
    if (state) {
      onConnectionStateChange(state);
    }
  }, [onConnectionStateChange]);

  const handleIceCandidateEvent = useCallback(
    (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        console.log("🧊 Sending ICE candidate");
        socket.emit("call:ice-candidate", {
          to: remotePeerId,
          candidate: event.candidate,
        });
      } else {
        console.log("🧊 All ICE candidates sent");
      }
    },
    [remotePeerId]
  );

  const getUserMedia = useCallback(async (requestedCallType: "voice" | "video", allowReceiveOnly: boolean = false) => {
    try {
      // Try to get video if requested
      if (requestedCallType === "video") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          console.log("✅ Got video stream");
          return { stream, actualCallType: "video" as const };
        } catch (videoError: any) {
          console.warn("⚠️ Cannot access video:", videoError.name, videoError.message);
          if (allowReceiveOnly) {
            console.log("👂 Device busy, using receive-only mode (no camera/mic sent)");
            // Create empty stream for receive-only mode
            return { stream: new MediaStream(), actualCallType: "voice" as const, receiveOnly: true };
          }
          // Try audio-only fallback
        }
      }
    } catch (error) {
      // If it's a critical error and receive-only is not allowed, rethrow
      if (!allowReceiveOnly && error instanceof Error && error.message.includes("đang được sử dụng")) {
        throw error;
      }
    }

    // Fallback to audio only
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      console.log("✅ Got audio-only stream");
      return { stream, actualCallType: "voice" as const };
    } catch (error: any) {
      console.error("❌ Cannot access audio:", error);
      
      if (allowReceiveOnly) {
        console.log("👂 Device busy, using receive-only mode (no audio sent)");
        // Create empty stream for receive-only mode
        return { stream: new MediaStream(), actualCallType: "voice" as const, receiveOnly: true };
      }
      
      if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        throw new Error("Microphone đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các tab/ứng dụng khác đang dùng microphone.");
      }
      throw error;
    }
  }, []);

  const setupPeerConnection = useCallback(
    async (stream: MediaStream) => {
      console.log("🔧 Setting up peer connection...");

      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          // Free TURN server for testing
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10,
      };

      peerConnection.current = new RTCPeerConnection(configuration);

      // Add local tracks
      stream.getTracks().forEach((track) => {
        console.log("➕ Adding track:", track.kind);
        peerConnection.current?.addTrack(track, stream);
      });

      // Setup event handlers
      peerConnection.current.ontrack = handleRemoteTrack;
      peerConnection.current.onconnectionstatechange = handleConnectionStateChange;
      peerConnection.current.oniceconnectionstatechange = handleIceConnectionStateChange;
      peerConnection.current.onicecandidate = handleIceCandidateEvent;
      
      // Debug: Log peer connection state every 2 seconds
      const debugInterval = setInterval(() => {
        if (peerConnection.current) {
          console.log("🔍 Peer connection status:", {
            signalingState: peerConnection.current.signalingState,
            iceConnectionState: peerConnection.current.iceConnectionState,
            connectionState: peerConnection.current.connectionState,
            senders: peerConnection.current.getSenders().length,
            receivers: peerConnection.current.getReceivers().length
          });
        } else {
          clearInterval(debugInterval);
        }
      }, 2000);
    },
    [
      handleRemoteTrack,
      handleConnectionStateChange,
      handleIceConnectionStateChange,
      handleIceCandidateEvent,
    ]
  );

  const createOffer = useCallback(async () => {
    try {
      console.log("🎥 Getting user media for caller...");
      const { stream, actualCallType } = await getUserMedia(callType);
      console.log("✅ Got user media for caller", stream.getTracks().map((t) => t.kind));

      // Notify if call type changed
      if (actualCallType !== callType && onCallTypeChange) {
        console.log(`📢 Call type changed from ${callType} to ${actualCallType}`);
        onCallTypeChange(actualCallType);
      }

      localStream.current = stream;
      hasCleanedUp.current = false; // Reset cleanup flag
      await setupPeerConnection(stream);

      if (peerConnection.current) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        console.log("📤 Sending offer to receiver...");
        console.log("🔍 Offer details:", {
          type: offer.type,
          sdpLength: offer.sdp?.length,
          hasSdp: !!offer.sdp
        });
        console.log("🔍 Local tracks in offer:", 
          peerConnection.current.getSenders().map(s => ({
            kind: s.track?.kind,
            enabled: s.track?.enabled,
            readyState: s.track?.readyState
          }))
        );
        
        socket.emit("call:initiate", {
          to: remotePeerId,
          conversationId,
          callType: actualCallType,
          offer,
        });
      }

      console.log("✅ Caller peer connection ready, waiting for answer...");
      return stream;
    } catch (error) {
      console.error("❌ Error creating offer:", error);
      throw error;
    }
  }, [callType, conversationId, remotePeerId, getUserMedia, setupPeerConnection, onCallTypeChange]);

  const createAnswer = useCallback(
    async (offer: RTCSessionDescriptionInit, requestedCallType: "voice" | "video") => {
      try {
        console.log("🎥 Getting user media for callee...");
        // Allow receive-only mode for callee (bên nhận chỉ cần nghe/xem)
        const { stream, actualCallType, receiveOnly } = await getUserMedia(requestedCallType, true);
        console.log("✅ Got user media for callee", {
          tracks: stream.getTracks().map((t) => t.kind),
          receiveOnly: receiveOnly || false
        });

        // Notify if call type changed
        if (actualCallType !== requestedCallType && onCallTypeChange) {
          console.log(`📢 Call type changed from ${requestedCallType} to ${actualCallType}`);
          onCallTypeChange(actualCallType);
        }

        localStream.current = stream;
        hasCleanedUp.current = false; // Reset cleanup flag
        await setupPeerConnection(stream);

        if (peerConnection.current) {
          console.log("📥 Setting remote offer and creating answer...");
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);

          console.log("📤 Sending answer to caller...");
          console.log("🔍 Answer details:", {
            type: answer.type,
            sdpLength: answer.sdp?.length,
            hasSdp: !!answer.sdp,
            receiveOnly: receiveOnly || false
          });
          console.log("🔍 Local tracks in answer:", 
            peerConnection.current.getSenders().map(s => ({
              kind: s.track?.kind,
              enabled: s.track?.enabled,
              readyState: s.track?.readyState
            }))
          );
          
          socket.emit("call:accept", {
            to: remotePeerId,
            conversationId,
            answer,
            actualCallType,
          });
        }

        return stream;
      } catch (error) {
        console.error("❌ Error creating answer:", error);
        throw error;
      }
    },
    [conversationId, remotePeerId, getUserMedia, setupPeerConnection, onCallTypeChange]
  );

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    console.log("📞 Call accepted, setting remote answer");
    console.log("🔍 Current signaling state:", peerConnection.current?.signalingState);
    console.log("🔍 Answer SDP:", answer);

    try {
      if (peerConnection.current?.signalingState === "have-local-offer") {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Remote description set, call connected");
        console.log("🔍 Updated signaling state:", peerConnection.current?.signalingState);
        console.log("🔍 Connection state:", peerConnection.current?.connectionState);
        console.log("🔍 ICE connection state:", peerConnection.current?.iceConnectionState);
      } else {
        console.warn(
          "⚠️ Cannot set remote description, wrong state:",
          peerConnection.current?.signalingState
        );
      }
    } catch (error) {
      console.error("❌ Error setting remote description:", error);
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    console.log("🧊 Received ICE candidate from remote");
    if (peerConnection.current && candidate) {
      try {
        if (peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ ICE candidate added");
        } else {
          console.warn("⚠️ Remote description not set yet, queueing ICE candidate");
          setTimeout(() => handleIceCandidate(candidate), 100);
        }
      } catch (error) {
        console.error("❌ Error adding ICE candidate:", error);
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    if (hasCleanedUp.current) {
      console.log("⏭️ Peer connection already cleaned up, skipping...");
      return;
    }
    
    console.log("🧹 Cleaning up peer connection...");
    
    // DON'T stop tracks here - let useCallControls handle it
    // to avoid double-stopping which can cause issues
    
    if (peerConnection.current) {
      console.log("🔌 Closing peer connection");
      peerConnection.current.close();
    }
    
    localStream.current = null;
    peerConnection.current = null;
    hasCleanedUp.current = true;
    console.log("✅ Peer connection cleanup complete");
  }, []);

  return {
    localStream,
    createOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    cleanup,
  };
}
