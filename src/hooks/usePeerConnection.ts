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

  const handleRemoteTrack = useCallback(
    (event: RTCTrackEvent) => {
      console.log("📥 Received remote track:", event.track.kind);
      if (event.streams[0]) {
        onRemoteStream(event.streams[0]);
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

  const getUserMedia = useCallback(async (requestedCallType: "voice" | "video") => {
    try {
      // Try to get video if requested
      if (requestedCallType === "video") {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("✅ Got video stream");
        return { stream, actualCallType: "video" as const };
      }
    } catch (error) {
      console.warn("⚠️ Cannot access video, falling back to audio only:", error);
    }

    // Fallback to audio only
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      console.log("✅ Got audio-only stream");
      return { stream, actualCallType: "voice" as const };
    } catch (error) {
      console.error("❌ Cannot access audio:", error);
      throw error;
    }
  }, []);

  const setupPeerConnection = useCallback(
    async (stream: MediaStream) => {
      console.log("🔧 Setting up peer connection...");

      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
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
      await setupPeerConnection(stream);

      if (peerConnection.current) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        console.log("📤 Sending offer to receiver...");
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
        const { stream, actualCallType } = await getUserMedia(requestedCallType);
        console.log("✅ Got user media for callee", stream.getTracks().map((t) => t.kind));

        // Notify if call type changed
        if (actualCallType !== requestedCallType && onCallTypeChange) {
          console.log(`📢 Call type changed from ${requestedCallType} to ${actualCallType}`);
          onCallTypeChange(actualCallType);
        }

        localStream.current = stream;
        await setupPeerConnection(stream);

        if (peerConnection.current) {
          console.log("📥 Setting remote offer and creating answer...");
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);

          console.log("📤 Sending answer to caller...");
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

    try {
      if (peerConnection.current?.signalingState === "have-local-offer") {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Remote description set, call connected");
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
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    localStream.current = null;
    peerConnection.current = null;
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
