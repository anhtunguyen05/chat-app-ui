import { useRouter } from "next/navigation";
import Notification from "@/components/header/notification/notification";
import UserAvatar from "@/components/user-avatar/user-avatar";
import UserDropdown from "@/components/header/interaction/user-menu/user-menu";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { logoutRequest } from "@/features/auth/authSlice";

export default function Interaction() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  

  const currentUser = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    dispatch(logoutRequest());
    router.push("/auth/login");
  };

  const handleMoveToProfile = () => {
    router.push("/profile");
  }

  return (
    <div className="flex items-center gap-4">
      <Notification />
      <UserDropdown
        name={currentUser?.nickname || "User"}
        email="anhtu@example.com"
        avatarUrl={currentUser?.avatarUrl}
        onLogout={() => handleLogout()}
        onMoveToProfile={() => handleMoveToProfile()}
      >
        <div>
          <UserAvatar
            src={currentUser?.avatarUrl}
            size={40}
            isOnline
            className="border border-gray-200 hover:ring-2 hover:ring-gray-300"
          />
        </div>
      </UserDropdown>
    </div>
  );
}
