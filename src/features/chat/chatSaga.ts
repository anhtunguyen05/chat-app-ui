import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Effect } from "redux-saga/effects";
import {
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
} from "./chatSlice";
import { User } from "@/types/user";
import { ChatState } from "@/features/chat/chatType";
import { getConversation } from "@/services/chatService";
import { getFriendList } from "@/services/friendService";


function* handleSetChatsRequest(action: PayloadAction<void>) {
  try {
    const friends: User[] = yield call(getFriendList);
    yield put(setChats(friends));
  }
  catch (error: any) {
    console.error("Failed to set chats:", error.message || error);
  } 
}


function* handleSetSelectedUser(action: PayloadAction<User | null>) {
  try {
    yield put(setSelectedUser(action.payload));
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

function* handleFetchMessages(action: PayloadAction<string>) {
  try {
    const messages: Object[] = yield call(getConversation, action.payload);
    yield put(setMessages(messages));
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

export default function* chatSaga() {
  yield takeLatest(setChatsRequest.type, handleSetChatsRequest);
  yield takeLatest(setSelectedUserRequest.type, handleSetSelectedUser);
  yield takeLatest(setActiveTabRequest.type, handleSetActiveTab);
  yield takeLatest(fetchMessagesRequest.type, handleFetchMessages);
  yield takeLatest(addMessageRequest.type, handleAddMessage);
}
