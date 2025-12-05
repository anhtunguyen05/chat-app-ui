"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CallModal from "@/components/call/call-modal";

export default function CallPage() {
  const searchParams = useSearchParams();
  const [callData, setCallData] = useState<any>(null);

  useEffect(() => {
    // Get call data from URL params
    const callerData = searchParams.get("data");
    
    if (callerData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(callerData));
        setCallData(parsed);
      } catch (error) {
        console.error("❌ Error parsing call data:", error);
        window.close();
      }
    }

    // Listen for messages from parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "CALL_DATA") {
        console.log("📞 Received call data from parent:", event.data.data);
        setCallData(event.data.data);
      } else if (event.data.type === "END_CALL") {
        console.log("📞 Received end call command from parent");
        window.close();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [searchParams]);

  const handleAccept = () => {
    console.log("✅ Call accepted");
    // Notify parent window
    if (window.opener) {
      window.opener.postMessage({ type: "CALL_ACCEPTED" }, "*");
    }
  };

  const handleReject = () => {
    console.log("❌ Call rejected/ended");
    // Notify parent window
    if (window.opener) {
      window.opener.postMessage({ type: "CALL_ENDED" }, "*");
    }
    // Close window after a short delay
    setTimeout(() => {
      window.close();
    }, 100);
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
