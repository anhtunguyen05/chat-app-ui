import { User } from "@/types/user";

export interface ChatState {
    selectedUser: User | null;
    activeTab: string;
    messages: Object[];
    page: number;
    hasMore: boolean;
    chats: User[];
    onlineList: string[];
}