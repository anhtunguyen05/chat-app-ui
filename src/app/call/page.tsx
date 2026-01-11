"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CallModal from "@/components/call/call-modal";
import { CallType } from "@/constants/socket-events";

interface CallData {
  from: string;
  to?: string;
  conversationId: string;
  callType: CallType;
  callerName?: string;
  callerAvatar?: string;
  offer?: RTCSessionDescriptionInit;
}

function CallContent() {
  const searchParams = useSearchParams();
  const [callData, setCallData] = useState<CallData | null>(null);

  useEffect(() => {
    // Get call data from URL params
    const callerData = searchParams.get("data");

    if (callerData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(callerData)) as CallData;
        setCallData(parsed);
      } catch (error) {
        console.error("❌ Error parsing call data:", error);
        window.close();
      }
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "CALL_DATA") {
        setCallData(event.data.data as CallData);
      } else if (event.data.type === "END_CALL") {
        window.close();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [searchParams]);

  const handleAccept = () => {
    if (window.opener) {
      window.opener.postMessage({ type: "CALL_ACCEPTED" }, "*");
    }
  };

  const handleReject = () => {
    if (window.opener) {
      window.opener.postMessage({ type: "CALL_ENDED" }, "*");
    }
    setTimeout(() => window.close(), 100);
  };

  if (!callData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải cuộc gọi...</p>
        </div>
      </div>
    );
  }

  return (
    <CallModal
      caller={callData}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
}

export default function CallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Đang tải cuộc gọi...</p>
          </div>
        </div>
      }
    >
      <CallContent />
    </Suspense>
  );
}
