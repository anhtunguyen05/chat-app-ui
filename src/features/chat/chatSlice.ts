import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";
import { ChatState } from "@/features/chat/chatType";
import { set } from "zod";

export const initialState: ChatState = {
  selectedUser: null,
  activeTab: "all",
  messages: [],
  page: 1,
  hasMore: true,
  chats: [],
  onlineList: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatsRequest(state, action: PayloadAction<void>) {},
    setChats(state, action: PayloadAction<User[]>) {
      state.chats = action.payload;
    },
    setSelectedUserRequest(state, action: PayloadAction<User | null>) {},
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
      state.hasMore = true;
    },
    setActiveTabRequest(state, action: PayloadAction<string>) {},
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    fetchMessagesRequest(
      state,
      action: PayloadAction<{ userId: string; page?: number }>
    ) {},
    setMessages(state, action: PayloadAction<Object[]>) {
      state.messages = action.payload;
    },
    appendMessages(state, action: PayloadAction<Object[]>) {
      state.messages = [...action.payload, ...state.messages]; // thêm vào đầu
    },
    addMessageRequest(state, action: PayloadAction<Object>) {},
    addMessage: (state, action: PayloadAction<Object>) => {
      state.messages.push(action.payload);
    },
    setOnlineListRequest(state, action: PayloadAction<string[]>) {},
    setOnlineList(state, action: PayloadAction<string[]>) {
      state.onlineList = action.payload;
    },
    setHasMore(state, action: PayloadAction<boolean>) {
      state.hasMore = action.payload;
    },
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
  appendMessages,
  addMessageRequest,
  addMessage,
  setOnlineListRequest,
  setOnlineList,
  setHasMore,
} = chatSlice.actions;

export default chatSlice.reducer;
