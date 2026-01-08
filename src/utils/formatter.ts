import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function timeFormat(time: Date) {
  return formatDistanceToNow(new Date(time), {
    addSuffix: true,
    locale: vi,
  });
}

interface ConversationFromAPI {
  id: string;
  type: string;
  target?: {
    avatarUrl?: string;
    name?: string;
    nickname?: string;
  };
  lastMessage?: {
    text?: string;
    createdAt?: Date;
    isRead?: boolean;
  };
  isRead?: boolean;
}

/**
 * Chuẩn hóa dữ liệu từ API để hiển thị trong ChatItem
 */
export function formatConversationForUI(convo: ConversationFromAPI) {
  const isGroup = convo.type === "group";
  const target = convo.target || {};

  const avatarUrl =
    target.avatarUrl ||
    (isGroup ? "/group-default.jpg" : "/default-avatar.jpg");

  const nickname = isGroup ? target.name : target.nickname;

  const lastMessage = convo.lastMessage;
  const message =
    lastMessage?.text ||
    (lastMessage
      ? "[Ảnh / File]"
      : isGroup
      ? "Chưa có tin nhắn"
      : "Bắt đầu cuộc trò chuyện");

  const time = lastMessage?.createdAt ? timeFormat(lastMessage.createdAt) : "";

  const isRead =
    typeof convo.isRead === "boolean"
      ? convo.isRead
      : lastMessage
      ? lastMessage.isRead ?? true
      : true;

  return {
    id: convo.id,
    avatarUrl,
    nickname,
    message,
    time,
    isGroup,
    isRead, 
    raw: convo, // lưu bản gốc nếu cần dùng lại
  };
}
