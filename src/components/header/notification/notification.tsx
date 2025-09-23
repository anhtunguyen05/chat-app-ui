import { Bell } from "lucide-react";
import { Icon } from "@/components/icon/icon";

export default function Notification() {
  return (
    // <button
    //   className="flex items-center justify-center
    //                  w-10 h-10 rounded-full
    //                  bg-gray-200 hover:bg-gray-300
    //                  transition-colors"
    // >
    //   <Bell className="w-5 h-5 text-gray-700" />
    // </button>
    <Icon name="bell" className="w-5 h-5 text-gray-700"></Icon>
  );
}
