import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";
import { ChatState } from "@/features/chat/chatType";
import { set } from "zod";

export const initialState: ChatState = {
  selectedUser: null,
  activeTab: "all",
  messages: [],
  chats: [],
  onlineList: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatsRequest(state,  action: PayloadAction<void>) {},
    setChats(state, action: PayloadAction<User[]>) {
      state.chats = action.payload;
    },
    setSelectedUserRequest(state, action: PayloadAction<User | null>) {},
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
    },
    setActiveTabRequest(state, action: PayloadAction<string>) {},
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    fetchMessagesRequest(state, action: PayloadAction<string>) {},
    setMessages(state, action: PayloadAction<Object[]>) {
      state.messages = action.payload;
    },
    addMessageRequest(state, action: PayloadAction<Object>) {},
    addMessage: (state, action: PayloadAction<Object>) => {
      state.messages.push(action.payload);
    },
    setOnlineListRequest(state, action: PayloadAction<string[]>) {},
    setOnlineList(state, action: PayloadAction<string[]>) {
      state.onlineList = action.payload;
    }
  },
});

export const {
  setChatsRequest,
  setChats,
  setSelectedUserRequest,
  setSelectedUser,
  setActiveTabRequest,
  setActiveTab,
  setMessages,
  fetchMessagesRequest,
  addMessageRequest,
  addMessage,
  setOnlineListRequest,
  setOnlineList,
} = chatSlice.actions;

export default chatSlice.reducer;
