import HeaderSidebar from "@/components/sidebar/header-sidebar/header-sidebar";
import SearchSidebar from "@/components/sidebar/search-sidebar/search-sidebar";
import ChatSidebar from "@/components/sidebar/chat-sidebar/chat-sidebar";

export default function Sidebar() {
  return (
    <aside
      className="w-90 bg-default border-r border-gray-200 dark:border-gray-700
                      flex flex-col h-[calc(100vh-56px)]"
    >
      <HeaderSidebar />
      <div className="flex items-center justify-center">
        <SearchSidebar />
      </div>
      <ChatSidebar />
    </aside>
  );
}
