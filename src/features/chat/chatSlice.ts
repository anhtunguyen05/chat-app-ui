import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";
import { ChatState, Conversation } from "@/features/chat/chatType";
import { set } from "zod";

export const initialState: ChatState = {
  selectedConversation: null,
  activeTab: "all",
  messages: [],
  conversations: [],
  page: 1,
  hasMore: true,
  onlineList: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversationsRequest(state, action: PayloadAction<void>) {},
    setConversations(state, action: PayloadAction<Object[]>) {
      state.conversations = action.payload;
    },
    setSelectedConversationRequest(
      state,
      action: PayloadAction<Conversation | null>
    ) {},
    setSelectedConversation(state, action: PayloadAction<Conversation | null>) {
      state.selectedConversation = action.payload;
      state.hasMore = true;
    },
    setActiveTabRequest(state, action: PayloadAction<string>) {},
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    fetchMessagesRequest(
      state,
      action: PayloadAction<{
        type: "private" | "group";
        targetId: string;
        page?: number;
      }>
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
  setConversationsRequest,
  setConversations,
  setSelectedConversationRequest,
  setSelectedConversation,
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
