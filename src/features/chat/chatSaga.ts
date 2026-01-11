import { call, put, takeLatest } from "redux-saga/effects";
import { current, type PayloadAction } from "@reduxjs/toolkit";
import type { Effect } from "redux-saga/effects";
import {
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
  addMessageRequest,
  addMessage,
  addPendingMessageRequest,
  addPendingMessage,
  appendMessages,
  setOnlineListRequest,
  setOnlineList,
  setHasMore,
  setParticipantsRequest,
  setParticipants,
  updateParticipantSeenMessageRequest,
  updateParticipantSeenMessage,
} from "./chatSlice";
import { Conversation, Message, Participant } from "@/features/chat/chatType";
import {
  getConversation,
  getConversations,
  getConversationParticipants,
} from "@/services/chatService";

function* handleSetConversations(action: PayloadAction<void>) {
  try {
    const conversations: Conversation[] = yield call(getConversations);
    yield put(setConversations(conversations));
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Failed to set chats:", err.message || error);
  }
}

function* handleSetSelectedConversation(
  action: PayloadAction<Conversation | null>
) {
  try {
    yield put(setSelectedConversation(action.payload));
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Failed to set selected user:", err.message || error);
  }
}

function* handleAddOrUpdateConversation(
  action: PayloadAction<{ message: Message; currentUserId: string }>
) {
  const { message, currentUserId } = action.payload;
  yield put(addOrUpdateConversation({ message, currentUserId }));
}

function* handleAddPendingMessage(
  action: PayloadAction<{ message: Message; currentUserId: string }>
) {
  const message: Message = action.payload.message;
  yield put(addPendingMessage(message));
}

function* handleSetLastReadMessageId(action: PayloadAction<string | null>) {
  try {
    yield put(setLastReadMessageId(action.payload));
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error(
      "Failed to set last read message ID:",
      err.message || error
    );
  }
}

function* handleUpdateMessageReadStatus(
  action: PayloadAction<{
    conversationId: string;
  }>
) {
  const { conversationId } = action.payload;
  yield put(updateMessageReadStatus({ conversationId }));
}

function* handleSetActiveTab(action: PayloadAction<string>) {
  try {
    yield put(setActiveTab(action.payload));
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Failed to set active tab:", err.message || error);
  }
}

function* handleFetchMessages(
  action: PayloadAction<{
    conversationId: string;
    page?: number;
  }>
) {
  try {
    const { conversationId, page = 1 } = action.payload;

    const messages: Message[] = yield call(
      getConversation,
      conversationId,
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
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Failed to fetch messages:", err.message || error);
  }
}

function* handleAddMessage(action: PayloadAction<Message>) {
  try {
    yield put(addMessage(action.payload));
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Failed to add message:", err.message || error);
  }
}

function* handleSetOnlineList(action: PayloadAction<string[]>) {
  try {
    yield put(setOnlineList(action.payload));
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Failed to set online list:", err.message || error);
  }
}

function* handleSetParticipants(
  action: PayloadAction<{ conversationId: string }>
): Generator<Effect, void, unknown> {
  try {
    const { conversationId } = action.payload;
    const response: unknown = yield call(
      getConversationParticipants,
      conversationId
    );

    // API có thể trả về dữ liệu trong response.data hoặc trực tiếp
    const participants: Participant[] = Array.isArray(response)
      ? response
      : (response as { data?: Participant[] })?.data || [];

    yield put(setParticipants(participants));
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("❌ Failed to fetch participants:", err.message || error);
  }
}

function* handleUpdateParticipantSeenMessage(
  action: PayloadAction<{ userId: string; lastSeenMessage: string }>
) {
  try {
    const { userId, lastSeenMessage } = action.payload;
    yield put(updateParticipantSeenMessage({ userId, lastSeenMessage }));
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error(
      "❌ Failed to update participant seen message:",
      err.message || error
    );
  }
}

export default function* chatSaga() {
  yield takeLatest(setConversationsRequest.type, handleSetConversations);
  yield takeLatest(
    setSelectedConversationRequest.type,
    handleSetSelectedConversation
  );
  yield takeLatest(
    addOrUpdateConversationRequest.type,
    handleAddOrUpdateConversation
  );
  yield takeLatest(addPendingMessageRequest.type, handleAddPendingMessage);
  yield takeLatest(
    setLastReadMessageIdRequest.type,
    handleSetLastReadMessageId
  );
  yield takeLatest(
    updateMessageReadStatusRequest.type,
    handleUpdateMessageReadStatus
  );
  yield takeLatest(setActiveTabRequest.type, handleSetActiveTab);
  yield takeLatest(fetchMessagesRequest.type, handleFetchMessages);
  yield takeLatest(addMessageRequest.type, handleAddMessage);
  yield takeLatest(setOnlineListRequest.type, handleSetOnlineList);
  yield takeLatest(setParticipantsRequest.type, handleSetParticipants);
  yield takeLatest(
    updateParticipantSeenMessageRequest.type,
    handleUpdateParticipantSeenMessage
  );
}
