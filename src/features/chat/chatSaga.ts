import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Effect } from "redux-saga/effects";
import {
  setConversationsRequest,
  setConversations,
  setSelectedConversationRequest,
  setSelectedConversation,
  setActiveTabRequest,
  setActiveTab,
  setMessages,
  fetchMessagesRequest,
  addMessageRequest,
  addMessage,
  appendMessages,
  setOnlineListRequest,
  setOnlineList,
  setHasMore,
} from "./chatSlice";
import { Conversation } from "@/features/chat/chatType";
import { getConversation, getConversations } from "@/services/chatService";

function* handleSetConversations(action: PayloadAction<void>) {
  try {
    const conversations: Object[] = yield call(getConversations);
    yield put(setConversations(conversations));
  } catch (error: any) {
    console.error("Failed to set chats:", error.message || error);
  }
}

function* handleSetSelectedConversation(
  action: PayloadAction<Conversation | null>
) {
  try {
    yield put(setSelectedConversation(action.payload));
  } catch (error: any) {
    console.error("Failed to set selected user:", error.message || error);
  }
}

function* handleSetActiveTab(action: PayloadAction<string>) {
  try {
    yield put(setActiveTab(action.payload));
  } catch (error: any) {
    console.error("Failed to set active tab:", error.message || error);
  }
}

function* handleFetchMessages(
  action: PayloadAction<{
    type: "private" | "group";
    targetId: string;
    page?: number;
  }>
) {
  try {
    const { type, targetId, page = 1 } = action.payload;

    const messages: Object[] = yield call(
      getConversation,
      type,
      targetId,
      page,
      20
    );

    if (page === 1) {
      yield put(setMessages(messages));
    } else {
      yield put(appendMessages(messages));
    }

    if (messages.length < 20) {
      yield put(setHasMore(false));
    }
  } catch (error: any) {
    console.error("Failed to fetch messages:", error.message || error);
  }
}

function* handleAddMessage(action: PayloadAction<Object>) {
  try {
    yield put(addMessage(action.payload));
  } catch (error: any) {
    console.error("Failed to add message:", error.message || error);
  }
}

function* handleSetOnlineList(action: PayloadAction<string[]>) {
  try {
    yield put(setOnlineList(action.payload));
  } catch (error: any) {
    console.error("Failed to set online list:", error.message || error);
  }
}

export default function* chatSaga() {
  yield takeLatest(setConversationsRequest.type, handleSetConversations);
  yield takeLatest(
    setSelectedConversationRequest.type,
    handleSetSelectedConversation
  );
  yield takeLatest(setActiveTabRequest.type, handleSetActiveTab);
  yield takeLatest(fetchMessagesRequest.type, handleFetchMessages);
  yield takeLatest(addMessageRequest.type, handleAddMessage);
  yield takeLatest(setOnlineListRequest.type, handleSetOnlineList);
}
