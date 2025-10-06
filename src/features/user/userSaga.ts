// src/features/user/userSaga.ts
import { call, put, takeLatest, Effect } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";
import {
  updateAvatarRequest,
  updateProfileSuccess,
  updateProfileFailure,
  updateNicknameRequest
} from "./userSlice";
import { UpdateAvatarPayload, UpdateNicknamePayload } from "@/features/user/userType";
import { updateAvatar, updateNickname } from "@/services/userService";
import { UpdateResponse } from "@/services/userService";

// Saga worker
function* handleUpdateAvatar(action: PayloadAction<UpdateAvatarPayload>) {
  try {
    const data: UpdateResponse = yield call(updateAvatar, action.payload);
    yield put(updateProfileSuccess(data.user)); // cập nhật state
  } catch (error: any) {
    yield put(
      updateProfileFailure(error.response?.data?.message || "Update failed")
    );
  }
}

function* handleUpdateNickname(action: PayloadAction<UpdateNicknamePayload>) {
  try {
    const data: UpdateResponse = yield call(updateNickname, action.payload);
    yield put(updateProfileSuccess(data.user)); // cập nhật state
  } catch (error: any) {
    yield put(
      updateProfileFailure(error.response?.data?.message || "Update failed")
    );
  }
}

// Saga watcher
export default function* userSaga() {
  yield takeLatest(updateAvatarRequest.type, handleUpdateAvatar);
  yield takeLatest(updateNicknameRequest.type, handleUpdateNickname)
}
