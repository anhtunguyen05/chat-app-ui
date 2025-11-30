// import { User } from "@/types/user";

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
  text: string | null;
  imageUrls: [];
  type: string;
  isRead?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  selectedConversation: Conversation | null;
  activeTab: string;
  conversations: Conversation[];
  messages: Object[];
  page: number;
  hasMore: boolean;
  onlineList: string[];
  lastReadMessageId: string | null;
  participants: Participant[];
  searchQuery: string;
}


