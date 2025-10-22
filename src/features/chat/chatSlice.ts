import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";
import { ChatState } from "@/features/chat/chatType";

export const initialState: ChatState = {
  selectedUser: null,
  activeTab: "chats",
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUserRequest(state, action: PayloadAction<User | null>) {},
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
    },
    setActiveTab(state, action: PayloadAction<"chats">) {
      state.activeTab = action.payload;
    },

    setMessages(state, action: PayloadAction<Object[]>) {
      state.messages = action.payload;
    },
    fetchMessagesRequest(state, action: PayloadAction<string>) {},
  },
});

export const {
  setSelectedUserRequest,
  setSelectedUser,
  setActiveTab,
  setMessages,
  fetchMessagesRequest,
} = chatSlice.actions;

export default chatSlice.reducer;
