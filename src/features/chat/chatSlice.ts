import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";
import {
  ChatState,
  Conversation,
  Message,
  Participant,
} from "@/features/chat/chatType";
import { set } from "zod";

export const initialState: ChatState = {
  selectedConversation: null,
  activeTab: "all",
  messages: [],
  conversations: [],
  page: 1,
  hasMore: true,
  onlineList: [],
  lastReadMessageId: null,
  participants: [],
  searchQuery: "",
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
      state.page = 1;
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

      const existing = state.conversations.find(
        (c) => c.id === message.conversation
      );

      const isMine = message.sender.id === currentUserId;
      const now = new Date();

      if (existing) {
        // Cập nhật conversation cũ
        existing.lastMessage = message.text || "Call";
        existing.lastMessageAt = message.createdAt
          ? new Date(message.createdAt)
          : now;
        existing.updatedAt = now;

        existing.isLastMessageRead = isMine;
        existing.isRead = isMine;

        // Cập nhật selectedConversation nếu là conversation đang mở
        if (state.selectedConversation?.id === message.conversation) {
          state.selectedConversation.lastMessage = message.text || "Call";
          state.selectedConversation.lastMessageAt = message.createdAt
            ? new Date(message.createdAt)
            : now;
          state.selectedConversation.updatedAt = now;
          state.selectedConversation.isLastMessageRead = isMine;
          state.selectedConversation.isRead = isMine;
        }
      } else {
        // Tạo mới nếu chưa tồn tại
        state.conversations.push({
          id: message.conversation, // ID phải là conversationId, không phải messageId
          type: message.group ? "group" : "private",
          name: "",
          lastMessage: message.text || "Call",
          lastMessageAt: message.createdAt ? new Date(message.createdAt) : now,
          updatedAt: now,
          createdAt: now,
          isLastMessageRead: isMine,
          isRead: isMine,
        });
      }

      state.conversations.sort((a, b) => {
        return (
          new Date(b.lastMessageAt || 0).getTime() -
          new Date(a.lastMessageAt || 0).getTime()
        );
      });
    },

    setLastReadMessageIdRequest(state, action: PayloadAction<string | null>) {},
    setLastReadMessageId(state, action: PayloadAction<string | null>) {
      state.lastReadMessageId = action.payload;
    },
    updateMessageReadStatusRequest(
      state,
      action: PayloadAction<{
        conversationId: string;
      }>
    ) {},
    updateMessageReadStatus: (
      state,
      action: PayloadAction<{
        conversationId: string;
      }>
    ) => {
      const { conversationId } = action.payload;

      const conv = state.conversations.find((c) => c.id === conversationId);
      if (!conv) return;

      // Set cho sidebar
      conv.isLastMessageRead = true;

      // Cập nhật selectedConversation nếu là conversation đang mở
      if (state.selectedConversation?.id === conversationId) {
        state.selectedConversation.isLastMessageRead = true;
      }
    },

    setActiveTabRequest(state, action: PayloadAction<string>) {},
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    fetchMessagesRequest(
      state,
      action: PayloadAction<{
        conversationId: string;
        page?: number;
      }>
    ) {},
    setMessages(state, action: PayloadAction<Object[]>) {
      state.messages = action.payload;
      state.page = 1; // Reset page về 1 khi load tin nhắn mới
    },
    appendMessages(state, action: PayloadAction<Object[]>) {
      const newMessages = action.payload;
      const existingIds = new Set(state.messages.map((m: any) => m.id));

      // Chỉ thêm những message chưa tồn tại
      const uniqueNewMessages = newMessages.filter(
        (m: any) => !existingIds.has(m.id)
      );

      state.messages = [...uniqueNewMessages, ...state.messages]; // thêm vào đầu
      state.page += 1; // Tăng page sau khi load thêm tin nhắn
    },
    addMessageRequest(state, action: PayloadAction<Object>) {},
    addMessage: (state, action: PayloadAction<Object>) => {
      const msg = action.payload as any;

      // Kiểm tra xem message đã tồn tại chưa
      if (state.messages.some((m: any) => m.id === msg.id)) {
        return; // Bỏ qua nếu đã tồn tại
      }

      state.messages.push(msg);
    },
    addPendingMessageRequest(state, action: PayloadAction<any>) {},
    addPendingMessage: (state, action: PayloadAction<any>) => {
      const msg = action.payload;

      // 1. Nếu message đã tồn tại → bỏ qua
      if (state.messages.some((m: any) => m.id === msg.id)) return;

      // 2. Chỉ add pending nếu conversation đang mở
      if (state.selectedConversation?.id === msg.conversationId) {
        state.messages.push(msg);
      }

      // 3. Nếu là conversation khác → tăng unread badge
      // else {
      //   if (!state.selectedConversation?.unread[msg.conversationId]) {
      //     state.selectedConversation.unread[msg.conversationId] = 0;
      //   }
      //   state.selectedConversation?.unread[msg.conversationId]++;
      // }
    },

    setOnlineListRequest(state, action: PayloadAction<string[]>) {},
    setOnlineList(state, action: PayloadAction<string[]>) {
      state.onlineList = action.payload;
    },
    setHasMore(state, action: PayloadAction<boolean>) {
      state.hasMore = action.payload;
    },
    setParticipantsRequest(
      state,
      action: PayloadAction<{ conversationId: string }>
    ) {},
    setParticipants(state, action: PayloadAction<Participant[]>) {
      state.participants = action.payload;
    },
    updateParticipantSeenMessageRequest(
      state,
      action: PayloadAction<{ userId: string; lastSeenMessage: string }>
    ) {},
    updateParticipantSeenMessage(
      state,
      action: PayloadAction<{ userId: string; lastSeenMessage: string }>
    ) {
      const { userId, lastSeenMessage } = action.payload;
      const participant = state.participants.find((p) => p.id === userId);
      if (participant) {
        participant.lastSeenMessageId = lastSeenMessage;
        participant.lastSeenAt = new Date();
      }
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
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
  setLastReadMessageIdRequest,
  setLastReadMessageId,
  updateMessageReadStatusRequest,
  updateMessageReadStatus,
  setActiveTabRequest,
  setActiveTab,
  setMessages,
  fetchMessagesRequest,
  appendMessages,
  addMessageRequest,
  addMessage,
  addPendingMessageRequest,
  addPendingMessage,
  setOnlineListRequest,
  setOnlineList,
  setHasMore,
  setParticipantsRequest,
  setParticipants,
  updateParticipantSeenMessageRequest,
  updateParticipantSeenMessage,
  setSearchQuery,
} = chatSlice.actions;

export default chatSlice.reducer;
