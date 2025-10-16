import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import Chat from "@/components/chat/chat";

export default function MessagesPage() {
  return (
    <div className="h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
}
