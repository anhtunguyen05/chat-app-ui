import { Icon } from "@/components/icon/icon";
import { CallType } from "@/constants/socket-events";

interface CallControlsProps {
  callStatus: "incoming" | "connecting" | "connected";
  callType: CallType;
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
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        {/* Accept Button */}
        <Icon 
          name="phone" 
          className="w-14 h-14 p-3.5 rounded-full bg-green-500 hover:bg-green-600 backdrop-blur-sm shadow-lg transition-all hover:scale-110 border border-green-500 text-white cursor-pointer" 
          onClick={onAccept}
        />

        {/* Reject Button */}
        <Icon 
          name="phone" 
          className="w-14 h-14 p-3.5 rounded-full bg-red-500 hover:bg-red-600 backdrop-blur-sm shadow-lg transition-all hover:scale-110 border border-red-500 text-white rotate-[135deg] cursor-pointer" 
          onClick={onReject}
        />
      </div>
    );
  }

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
      {/* Mute Button */}
      <Icon
        name={isMuted ? "micOff" : "mic"}
        className={`w-12 h-12 p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm border cursor-pointer ${
          isMuted
            ? "bg-white/10 hover:bg-white/20 border-red-400/50 text-red-400"
            : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
        }`}
        onClick={onToggleMute}
      />

      {/* Video Toggle - Always show (can upgrade voice to video) */}
      <Icon
        name={isVideoOff ? "cameraOff" : "camera"}
        className={`w-12 h-12 p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm border cursor-pointer ${
          isVideoOff
            ? "bg-white/10 hover:bg-white/20 border-red-400/50 text-red-400"
            : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
        }`}
        onClick={onToggleVideo}
        title={callType === "voice" ? "Bật camera (nâng cấp lên video)" : isVideoOff ? "Bật camera" : "Tắt camera"}
      />

      {/* End Call Button */}
      <Icon 
        name="phone" 
        className="w-14 h-14 p-3 rounded-full bg-red-500 hover:bg-red-600 backdrop-blur-sm shadow-lg transition-all hover:scale-110 border border-red-500 text-white rotate-[135deg] cursor-pointer" 
        onClick={onEndCall}
      />
    </div>
  );
}