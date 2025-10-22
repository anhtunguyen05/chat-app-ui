import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Effect } from "redux-saga/effects";
import {
  setSelectedUser,
  setSelectedUserRequest,
  setActiveTab,
  setMessages,
  fetchMessagesRequest,
} from "./chatSlice";
import { User } from "@/types/user";
import { ChatState } from "@/features/chat/chatType";
import { getConversation } from "@/services/chatService";

function* handleSetSelectedUser(action: PayloadAction<User | null>) {
  try {
    yield put(setSelectedUser(action.payload));
  } catch (error: any) {
    console.error("Failed to set selected user:", error.message || error);
  }
}

function* handleSetActiveTab(action: PayloadAction<"chats">) {
  try {
    yield put(setActiveTab(action.payload));
  } catch (error: any) {
    console.error("Failed to set active tab:", error.message || error);
  }
}

function* handleFetchMessages(action: PayloadAction<string>) {
  try {
    const messages: Object[] = yield call(getConversation, action.payload);
    yield put(setMessages(messages));
  } catch (error: any) {
    console.error("Failed to fetch messages:", error.message || error);
  }
}

export default function* chatSaga() {
  yield takeLatest(setSelectedUserRequest.type, handleSetSelectedUser);
  yield takeLatest(setActiveTab.type, handleSetActiveTab);
  yield takeLatest(fetchMessagesRequest.type, handleFetchMessages);
}
