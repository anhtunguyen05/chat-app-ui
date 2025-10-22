import { User } from "@/types/user";

export interface ChatState {
    selectedUser: User | null;
    activeTab: "chats",
    messages: Object[];
}