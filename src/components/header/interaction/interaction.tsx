import Notification from "@/components/header/notification/notification";
import UserAvatar from "@/components/user-avatar/user-avatar";
import UserDropdown from "@/components/header/interaction/user-menu/user-menu";
import Image from "next/image";

export default function Interaction() {
  return (
    <div className="flex items-center gap-4">
      <Notification />
      <UserDropdown
        name="Nguyenanhtu"
        email="anhtu@example.com"
        onLogout={() => console.log("Logout clicked")}
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
