import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import chatReducer from "@/features/chat/chatSlice";

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    chat: chatReducer
});

export default rootReducer;