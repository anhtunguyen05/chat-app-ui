import HeaderSidebar from "@/components/sidebar/header-sidebar/header-sidebar";
import SearchSidebar from "@/components/sidebar/search-sidebar/search-sidebar";

export default function Sidebar() {
  return (
    <aside
      className="w-90 bg-transparent dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
                      flex flex-col h-screen"
    >
      <HeaderSidebar />
      <div className="flex items-center justify-center">
        <SearchSidebar />
      </div>
    </aside>
  );
}
