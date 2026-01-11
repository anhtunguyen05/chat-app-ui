import { CallType } from "@/constants/socket-events";

export interface CallData {
  from: string;
  to?: string;
  conversationId: string;
  callType: CallType;
  callerName?: string;
  callerAvatar?: string;
  offer?: RTCSessionDescriptionInit;
}
