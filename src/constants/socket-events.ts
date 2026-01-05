// Socket events cho user/connection
export enum UserSocketEvent {
  JOIN = "join",
  USER_ONLINE = "userOnline",
  USER_STATUS = "userStatus",
  ONLINE_LIST = "onlineList",
}

// Socket events cho conversation
export enum ConversationSocketEvent {
  JOIN_CONVERSATION = "conversation:join",
  LEAVE_CONVERSATION = "conversation:leave",
  TYPING = "conversation:typing",
  STOP_TYPING = "conversation:stop-typing",
}

// Socket events cho message
export enum MessageSocketEvent {
  SEND_MESSAGE = "message:send",
  RECEIVE_MESSAGE = "message:receive",
  MESSAGE_SENT = "message:sent",
  PENDING_MESSAGES = "message:pending",
  GET_PENDING_MESSAGES = "message:get-pending",
  MARK_AS_READ = "message:mark-as-read",
  MESSAGE_READ = "message:read",
}

// Socket events cho call
export enum CallSocketEvent {
  // Initiate & Accept
  INITIATE = "call:initiate",
  INCOMING = "call:incoming",
  ACCEPT = "call:accept",
  ACCEPTED = "call:accepted",
  
  // Reject & End
  REJECT = "call:reject",
  REJECTED = "call:rejected",
  END = "call:end",
  ENDED = "call:ended",
  MISSED = "call:missed",
  
  // WebRTC
  ICE_CANDIDATE = "call:ice-candidate",
  
  // Controls
  TOGGLE_VIDEO = "call:toggle-video",
  VIDEO_TOGGLED = "call:video-toggled",
  TOGGLE_AUDIO = "call:toggle-audio",
  AUDIO_TOGGLED = "call:audio-toggled",
  
  // Upgrade
  UPGRADE_TO_VIDEO = "call:upgrade-to-video",
  UPGRADE_REQUEST = "call:upgrade-request",
  UPGRADE_ACCEPT = "call:upgrade-accept",
  UPGRADE_ACCEPTED = "call:upgrade-accepted",
}

// Socket events chung
export enum CommonSocketEvent {
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  CONNECT_ERROR = "connect_error",
  ERROR = "error",
}


export enum MessageType {
  TEXT = "text",
  STICKER = "sticker",
  IMAGE = "image",
  VIDEO = "video",
  MIXED = "mixed",
  CALL = "call",
}

export enum CallType {
  VOICE = "voice",
  VIDEO = "video",
}

export enum CallStatus {
  MISSED = "missed",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ConversationType {
  PRIVATE = "private",
  GROUP = "group",
}

export enum ParticipantRole {
  MEMBER = "member",
  ADMIN = "admin",
}

export enum FriendRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}
