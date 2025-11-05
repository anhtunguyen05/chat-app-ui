import { User } from "@/types/user";


export interface Conversation {
  id: string;
  type: "private" | "group";
  target: any; // user hoặc group
  lastMessage?: any;
}


export interface ChatState {
    selectedConversation:  Conversation | null;
    activeTab: string;
    conversations: Object[]
    messages: Object[];
    page: number;
    hasMore: boolean;
    onlineList: string[];
}