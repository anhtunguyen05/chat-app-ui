import Notification from "@/components/header/notification/notification";
import UserAvatar from "@/components/user-avatar/user-avatar";
import UserDropdown from "@/components/header/interaction/user-menu/user-menu";
import Image from "next/image";
import { logout } from "@/services/authService";

export default function Interaction() {
  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Notification />
      <UserDropdown
        name="Nguyenanhtu"
        email="anhtu@example.com"
        onLogout={() => handleLogout()}
      >
        <div>
            <UserAvatar
              size={40}
              isOnline
              className="border border-gray-200 hover:ring-2 hover:ring-gray-300"
            />
        </div>
      </UserDropdown>
    </div>
  );
}
