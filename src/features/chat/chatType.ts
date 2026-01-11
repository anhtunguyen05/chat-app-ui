import { CallType, CallStatus, MessageType } from "@/constants/socket-events";

export interface ConversationTarget {
  id: string;
  nickname?: string;
  name?: string;
  avatarUrl?: string;
}

export interface Conversation {
  id: string;
  type: "private" | "group";
  name: string;
  slug?: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastSeen?: Date;
  isLastMessageRead?: boolean;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  nickname: string;
  avatarUrl: string;
}

export interface Participant {
  id: string;
  userId: string;
  slug?: string;
  nickname?: string;
  name?: string;
  avatarUrl?: string;
  lastSeenMessageId?: string | null;
  lastSeenAt?: Date;
}

export interface Message {
  id: string;
  sender: User;

  conversation: string;
  receiver: User | null;
  group: string | null;

  type: MessageType

  text: string | null;
  imageUrls: string[];

  callData?: {
    callType: CallType
    status: CallStatus
    duration: number;
    startedAt: Date;
    endedAt: Date;
  };

  isRead: boolean;
  readBy: string[];

  createdAt: Date;
  updatedAt: Date;
}


export interface ChatState {
  selectedConversation: Conversation | null;
  activeTab: string;
  conversations: Conversation[];
  messages: Message[];
  page: number;
  hasMore: boolean;
  onlineList: string[];
  lastReadMessageId: string | null;
  participants: Participant[];
  searchQuery: string;
}


