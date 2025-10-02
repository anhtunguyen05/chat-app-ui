import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AuthState,
  User,
  LoginPayload,
  RegisterPayload,
  LoginGooglePayload,
} from "./authType";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ---- LOGIN ----
    loginRequest(state, _action: PayloadAction<LoginPayload>) {
      state.loading = true;
      state.error = null;
    },
    loginWithGoogleRequest(state, _action: PayloadAction<LoginGooglePayload>) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- REGISTER ----
    registerRequest(state, _action: PayloadAction<RegisterPayload>) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.loading = false;
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- LOGOUT ----
    logoutRequest(state) {
      state.loading = true;
    },
    logoutSuccess(state) {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
    },
    logoutFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- EXTRA: SUPPORT REFRESH PAGE ----
    setCredentials(
      state,
      action: PayloadAction<{ user: User; }>
    ) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    finishLoading(state) {
      state.loading = false;
    },
  },
});

export const {
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
  setCredentials,
  finishLoading,
} = authSlice.actions;

export default authSlice.reducer;
