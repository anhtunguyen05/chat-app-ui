import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";
import { ChatState, Conversation, Message } from "@/features/chat/chatType";
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
    setConversations(state, action: PayloadAction<Conversation[]>) {
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
    addOrUpdateConversationRequest: (
      state,
      action: PayloadAction<{ message: Message; currentUserId: string | null }>
    ) => {},
    addOrUpdateConversation: (
      state,
      action: PayloadAction<{ message: Message; currentUserId: string | null }>
    ) => {
      const { message, currentUserId } = action.payload;

      let convId: string | null | undefined;

      if (message.group) {
        convId = message.group;
      } else {
        convId =
          message.sender.id === currentUserId
            ? message.receiver?.id
            : message.sender.id;
      }

      if (!convId) return;

      const existing = (state.conversations as Conversation[]).find(
        (c) => c.id === convId
      );

      const isFromMe = message.sender.id === currentUserId;

      if (existing) {
        existing.lastMessage = message;
        existing.updatedAt = message.createdAt || new Date().toISOString();

        // ✅ Nếu mình gửi tin nhắn → xem như đoạn này đã đọc
        if (isFromMe) {
          existing.isRead = true;
        } else {
          // ✅ Nếu tin từ người khác → chưa đọc
          existing.isRead = false;
        }

        // 🔹 Đưa lên đầu
        state.conversations = [
          existing,
          ...state.conversations.filter((c) => c.id !== convId),
        ];
      } else {
        const newConv: Conversation = {
          id: convId,
          type: message.group ? "group" : "private",
          target: message.group
            ? {
                id: convId,
                name: message.group || "Nhóm mới",
                avatarUrl: "/group-default.jpg",
              }
            : {
                id: convId,
                nickname:
                  message.sender.id === currentUserId
                    ? message.receiver?.nickname || "Người dùng"
                    : message.sender?.nickname || "Người dùng",
                avatarUrl:
                  message.sender.id === currentUserId
                    ? message.receiver?.avatarUrl || "/default-avatar.jpg"
                    : message.sender?.avatarUrl || "/default-avatar.jpg",
              },
          lastMessage: message,
          updatedAt: message.createdAt || new Date().toISOString(),
          isRead: isFromMe, // mình gửi thì true
        };

        state.conversations.unshift(newConv);
      }
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
  addOrUpdateConversationRequest,
  addOrUpdateConversation,
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
