import { call, put, takeLatest } from "redux-saga/effects";
import {
  loginRequest,
  loginWithGoogleRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
} from "./authSlice";
import {
  loginWithGoogle,
  login,
  register,
  logout,
} from "@/services/authService";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Effect } from "redux-saga/effects";
import type {
  LoginPayload,
  RegisterPayload,
  User,
  LoginGooglePayload,
} from "./authType";

function* handleLogin(action: PayloadAction<LoginPayload>) {
  try {
    const data: { user: any; accessToken: string } = yield call(
      login,
      action.payload
    );
    yield put(loginSuccess(data));
  } catch (error: any) {
    yield put(loginFailure(error.message || "Login failed"));
  }
}

function* handleLoginWithGoogle(action: PayloadAction<LoginGooglePayload>) {
  try {
    const data: { user: any; accessToken: string } = yield call(
      loginWithGoogle,
      action.payload.token
    );
    yield put(loginSuccess(data));
  } catch (error: any) {
    yield put(loginFailure(error.message || "Login failed"));
  }
}

function* handleRegister(
  action: PayloadAction<RegisterPayload>
): Generator<Effect, void, User> {
  try {
    const user = yield call(register, action.payload);
    yield put(registerSuccess(user));
  } catch (error: any) {
    yield put(registerFailure(error.message || "Register failed"));
  }
}

function* handleLogout(action: PayloadAction<void>) {
  try {
    yield call(logout);
    yield put(logoutSuccess());
  } catch (error: any) {
    yield put(logoutFailure(error.message || "Logout failed"));
  }
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(loginWithGoogleRequest.type, handleLoginWithGoogle);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(logoutRequest.type, handleLogout);
}
