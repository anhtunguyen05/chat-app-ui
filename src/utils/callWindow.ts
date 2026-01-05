/**
 * Utility functions to manage call windows (popup/tab)
 */

import { CallType } from "@/constants/socket-events";

let callWindow: Window | null = null;

interface CallData {
  from: string;
  to?: string;
  conversationId: string;
  callType: CallType;
  callerName?: string;
  callerAvatar?: string;
  offer?: RTCSessionDescriptionInit;
}

/**
 * Open a new window/tab for the call
 */
export function openCallWindow(callData: CallData): Window | null {
  // Close existing call window if any
  if (callWindow && !callWindow.closed) {
    callWindow.close();
  }

  const width = 800;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  const features = `
    width=${width},
    height=${height},
    left=${left},
    top=${top},
    toolbar=no,
    menubar=no,
    scrollbars=no,
    resizable=yes,
    status=no
  `.replace(/\s/g, '');

  const encodedData = encodeURIComponent(JSON.stringify(callData));
  const url = `/call?data=${encodedData}`;
  
  callWindow = window.open(url, "CallWindow", features);

  if (!callWindow) {
    console.error("❌ Failed to open call window. Popup might be blocked.");
    alert("Không thể mở cửa sổ cuộc gọi. Vui lòng cho phép popup cho trang này.");
    return null;
  }

  // Send call data via postMessage as backup
  if (callWindow) {
    // Wait for window to load before sending message
    setTimeout(() => {
      callWindow?.postMessage({ type: "CALL_DATA", data: callData }, "*");
    }, 500);
  }

  return callWindow;
}

/**
 * Close the call window
 */
export function closeCallWindow() {
  if (callWindow && !callWindow.closed) {
    callWindow.postMessage({ type: "END_CALL" }, "*");
    callWindow.close();
    callWindow = null;
  }
}

/**
 * Check if call window is open
 */
export function isCallWindowOpen(): boolean {
  return callWindow !== null && !callWindow.closed;
}

/**
 * Focus the call window if it's open
 */
export function focusCallWindow() {
  if (callWindow && !callWindow.closed) {
    callWindow.focus();
  }
}

/**
 * Get the current call window
 */
export function getCallWindow(): Window | null {
  return callWindow && !callWindow.closed ? callWindow : null;
}
