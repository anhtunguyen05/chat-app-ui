import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user";
import { UserState } from "./userType";

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  success: false
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },

    clearUser(state) {
      state.user = null;
    },

    // --- UPDATE PROFILE ---
    updateProfileRequest(state, _action: PayloadAction<{ file: File }>) {
      state.loading = true;
      state.error = null;
      state.success=false
    },
    updateProfileSuccess(state, action: PayloadAction<User>) {
      state.loading = false;
      state.user = action.payload;
       state.success=true // cập nhật profile mới
    },
    updateProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
       state.success=false
    },
    resetSuccess(state) {
      state.success = false
    }
  },
});

export const {
  setUser,
  clearUser,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  resetSuccess
} = userSlice.actions;
export default userSlice.reducer;
