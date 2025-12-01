import { Icon } from "@/components/icon/icon";

interface CallControlsProps {
  callStatus: "incoming" | "connecting" | "connected";
  callType: "voice" | "video";
  isMuted: boolean;
  isVideoOff: boolean;
  onAccept?: () => void;
  onReject: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export default function CallControls({
  callStatus,
  callType,
  isMuted,
  isVideoOff,
  onAccept,
  onReject,
  onToggleMute,
  onToggleVideo,
  onEndCall,
}: CallControlsProps) {
  if (callStatus === "incoming") {
    return (
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
        {/* Accept Button */}
        <button
          onClick={onAccept}
          className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <Icon name="phone" className="w-8 h-8 text-white" />
        </button>

        {/* Reject Button */}
        <button
          onClick={onReject}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <Icon name="phone" className="w-8 h-8 text-white rotate-[135deg]" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
      {/* Mute Button */}
      <button
        onClick={onToggleMute}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
          isMuted
            ? "bg-red-500 hover:bg-red-600"
            : "bg-white/20 hover:bg-white/30"
        }`}
      >
        <Icon
          name={isMuted ? "phoneIncoming" : "mic"}
          className="w-6 h-6 text-white"
        />
      </button>

      {/* Video Toggle (only for video calls) */}
      {callType === "video" && (
        <button
          onClick={onToggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
            isVideoOff
              ? "bg-red-500 hover:bg-red-600"
              : "bg-white/20 hover:bg-white/30"
          }`}
        >
          <Icon
            name={isVideoOff ? "phoneIncoming" : "video"}
            className="w-6 h-6 text-white"
          />
        </button>
      )}

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all hover:scale-110"
      >
        <Icon name="phone" className="w-8 h-8 text-white rotate-[135deg]" />
      </button>
    </div>
  );
}
