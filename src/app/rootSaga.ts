import { all } from "redux-saga/effects";
import authSaga from "../features/auth/authSaga";
import userSaga from "@/features/user/userSaga";
import chatSaga from "@/features/chat/chatSaga";

export default function* rootSaga() {
  yield all([authSaga(), userSaga(), chatSaga()]);
}
