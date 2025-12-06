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
      if (event.streams[0]) {
        onRemoteStream(event.streams[0]);
      } else {
        console.error("No stream in track event!");
      }
    },
    [onRemoteStream]
  );

  const handleIceConnectionStateChange = useCallback(() => {
    // ICE connection state tracking (silent)
  }, []);

  const handleConnectionStateChange = useCallback(() => {
    const state = peerConnection.current?.connectionState;
    if (state) onConnectionStateChange(state);
  }, [onConnectionStateChange]);

  const handleIceCandidateEvent = useCallback(
    (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socket.emit("call:ice-candidate", {
          to: remotePeerId,
          candidate: event.candidate,
        });
      }
    },
    [remotePeerId]
  );

  const getUserMedia = useCallback(async (requestedCallType: "voice" | "video", allowReceiveOnly: boolean = false) => {
    try {
      if (requestedCallType === "video") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          return { stream, actualCallType: "video" as const };
        } catch (videoError: any) {
          if (allowReceiveOnly) {
            return { stream: new MediaStream(), actualCallType: "voice" as const, receiveOnly: true };
          }
        }
      }
    } catch (error) {
      if (!allowReceiveOnly && error instanceof Error && error.message.includes("đang được sử dụng")) {
        throw error;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      return { stream, actualCallType: "voice" as const };
    } catch (error: any) {
      if (allowReceiveOnly) {
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
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10,
      };

      peerConnection.current = new RTCPeerConnection(configuration);

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

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
      const { stream, actualCallType } = await getUserMedia(callType);

      if (actualCallType !== callType && onCallTypeChange) {
        onCallTypeChange(actualCallType);
      }

      localStream.current = stream;
      hasCleanedUp.current = false;
      await setupPeerConnection(stream);

      if (peerConnection.current) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        
        socket.emit("call:initiate", {
          to: remotePeerId,
          conversationId,
          callType: actualCallType,
          offer,
        });
      }

      return stream;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }, [callType, conversationId, remotePeerId, getUserMedia, setupPeerConnection, onCallTypeChange]);

  const createAnswer = useCallback(
    async (offer: RTCSessionDescriptionInit, requestedCallType: "voice" | "video") => {
      try {
        const { stream, actualCallType } = await getUserMedia(requestedCallType, true);

        if (actualCallType !== requestedCallType && onCallTypeChange) {
          onCallTypeChange(actualCallType);
        }

        localStream.current = stream;
        hasCleanedUp.current = false;
        await setupPeerConnection(stream);

        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          
          socket.emit("call:accept", {
            to: remotePeerId,
            conversationId,
            answer,
            actualCallType,
          });
        }

        return stream;
      } catch (error) {
        console.error("Error creating answer:", error);
        throw error;
      }
    },
    [conversationId, remotePeerId, getUserMedia, setupPeerConnection, onCallTypeChange]
  );

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnection.current?.signalingState === "have-local-offer") {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error("Error setting remote description:", error);
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (peerConnection.current && candidate) {
      try {
        if (peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          setTimeout(() => handleIceCandidate(candidate), 100);
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    if (hasCleanedUp.current) return;
    
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    
    localStream.current = null;
    peerConnection.current = null;
    hasCleanedUp.current = true;
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
