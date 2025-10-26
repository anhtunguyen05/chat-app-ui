import { User } from "@/types/user";

export interface ChatState {
    selectedUser: User | null;
    activeTab: string;
    messages: Object[];
    chats: User[];
    onlineList: string[];
}