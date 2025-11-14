// import { User } from "@/types/user";

export interface Conversation {
  id: string;
  type: "private" | "group";
  target: any; // user hoặc group
  lastMessage?: any;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  nickname: string;
  avatarUrl: string;
}

export interface Message {
  id: string;
  sender: User;
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
}
