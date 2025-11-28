import { useRouter } from "next/navigation";
import { Conversation } from "@/features/chat/chatType";
import { Icon } from "@/components/icon/icon";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { Collapsible } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/hooks/useAppSelector";

interface InformationProps {
  selectedConversation: Conversation;
}

export default function Information({
  selectedConversation,
}: InformationProps) {
  const router = useRouter();

  const participants = useAppSelector((state) => state.chat.participants);

  const handleMoveToProfile = () => {
    if (selectedConversation.slug) {
      router.push(`/profile/${selectedConversation.slug}`);
    }
  };

const handleMoveToMemberProfile = (slug?: string) => {
    if (slug) {
      router.push(`/profile/${slug}`);
    }
  };

  const handleMessageMember = (userId: string) => {
    // Tạm thời điều hướng kèm query; có thể thay bằng mở/ tạo conversation riêng
    router.push(`/chat?to=${userId}`);
  };

  return (
    <div className="w-80 2xl:w-120 bg-white rounded-md p-4 overflow-y-auto">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 pb-4 ">
          <UserAvatar
            src={selectedConversation.avatar}
            alt={selectedConversation.name}
            size={80}
          />
          <h3 className="text-xl font-semibold text-neutral-900">
            {selectedConversation.name}
          </h3>
          <div className="flex items-center gap-10 mt-2">
            {selectedConversation.type === "private" && (
              <div
                className="flex flex-col items-center gap-1 cursor-pointer"
                onClick={handleMoveToProfile}
              >
                <Icon
                  name="circleUserRound"
                  size={23}
                  buttonClassName="w-10 h-10"
                />
                <span className="text-xs text-neutral-600">Trang cá nhân</span>
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <Icon name="bell" size={23} buttonClassName="w-10 h-10" />
              <span className="text-xs text-neutral-600">Tắt thông báo</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Icon name="search" size={23} buttonClassName="w-10 h-10" />
              <span className="text-xs text-neutral-600">Tìm kiếm</span>
            </div>
          </div>
        </div>

        {/* Thông tin đoạn chat */}
        <Collapsible title="Thông tin về đoạn chat" defaultOpen={false}>
          <div className="flex items-center gap-2 p-3 text-sm">
            <span className="text-neutral-900 font-medium">Loại:</span>
            <span className="text-neutral-900 font-medium">
              {selectedConversation.type === "private"
                ? "Trò chuyện riêng"
                : "Nhóm"}
            </span>
          </div>
        </Collapsible>

        {/* Tùy chỉnh đoạn chat */}
        <Collapsible title="Tùy chỉnh đoạn chat" defaultOpen={true}>
          {/* <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <Icon name="palette" size={20} className="text-orange-600" />
            <span className="text-sm text-neutral-700">Đổi chủ đề</span>
          </button> */}
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 transition-colors">
            <Icon name="smile" size={20} className="text-yellow-600" />
            <span className="text-md font-semibold text-neutral-900">
              Thay đổi biểu tượng cảm xúc
            </span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 transition-colors">
            <span className="text-md font-semibold ">Aa</span>
            <span className="text-md text-neutral-900 font-semibold">
              Chỉnh sửa biệt danh
            </span>
          </button>
        </Collapsible>

        {selectedConversation.type === "group" && (
          <Collapsible title="Thành viên trong đoạn chat" defaultOpen={false}>
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar src={participant.avatarUrl} size={30} />
                  <span className="text-sm text-neutral-900 font-medium">
                    {participant.nickname}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 rounded-full transition-colors"
                      aria-label="Tùy chọn thành viên"
                    >
                      <Icon name="ellipsis" buttonClassName="bg-transparent"/>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => handleMessageMember(participant.userId)}>
                      <Icon name="messageCircle" className="text-neutral-600" />
                      <span>Nhắn tin</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMoveToMemberProfile(participant.slug)}>
                      <Icon name="circleUserRound" className="text-neutral-600" />
                      <span>Xem trang cá nhân</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </Collapsible>
        )}

        {/* File phương tiện & File */}
        <Collapsible title="File phương tiện & file" defaultOpen={true}>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 transition-colors">
            <Icon name="image" size={20} className="text-violet-600" />
            <span className="text-md text-neutral-900 font-semibold">
              File phương tiện
            </span>
          </button>
          {/* <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <Icon name="file" size={20} className="text-violet-600" />
            <span className="text-sm text-neutral-700">File</span>
          </button> */}
        </Collapsible>

        {/* Quyền riêng tư và hỗ trợ */}
        {/* <Collapsible title="Quyền riêng tư và hỗ trợ" defaultOpen={false}>
          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <Icon name="ban" size={20} className="text-red-600" />
            <span className="text-sm text-neutral-700">Chặn</span>
          </button>
          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <Icon name="flag" size={20} className="text-red-600" />
            <span className="text-sm text-neutral-700">Báo cáo</span>
          </button>
        </Collapsible> */}
      </div>
    </div>
  );
}
