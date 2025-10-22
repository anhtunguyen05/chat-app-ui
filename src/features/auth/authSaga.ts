import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Effect } from "redux-saga/effects";
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
import { setUser, clearUser } from "@/features/user/userSlice";
import {
  loginWithGoogle,
  login,
  register,
  logout,
} from "@/services/authService";
import type {
  LoginPayload,
  RegisterPayload,
  LoginGooglePayload,
} from "./authType";
import type { User } from "@/types/user";

function* handleLogin(action: PayloadAction<LoginPayload>) {
  try {
    const data: { user: any } = yield call(login, action.payload);
    yield put(loginSuccess());
    yield put(setUser(data.user));
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
    yield put(loginSuccess());
    yield put(setUser(data.user));
  } catch (error: any) {
    yield put(loginFailure(error.message || "Login failed"));
  }
}

function* handleRegister(
  action: PayloadAction<RegisterPayload>
): Generator<Effect, void, User> {
  try {
    const user = yield call(register, action.payload);
    yield put(registerSuccess());
    yield put(setUser(user));
  } catch (error: any) {
    yield put(registerFailure(error.message || "Register failed"));
  }
}

function* handleLogout() {
  try {
    yield call(logout);
    yield put(logoutSuccess());
    yield put(clearUser());
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
