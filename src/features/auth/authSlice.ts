import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";
import {
  AuthState,
  LoginPayload,
  RegisterPayload,
  LoginGooglePayload,
} from "./authType";

const initialState: AuthState = {
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
    loginSuccess(state,) {
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
    registerSuccess(state,) {
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
      state.loading = false;
    },
    logoutFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---- EXTRA: SUPPORT REFRESH PAGE ----
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
  finishLoading,
} = authSlice.actions;

export default authSlice.reducer;
