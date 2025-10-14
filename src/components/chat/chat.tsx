import HeaderChat from "@/components/chat/header-chat/header-chat";
import Info from "@/components/chat/info/info";

export default function Chat() {
  return (
    <div className=" flex-1 bg-neutral-100 p-4">
      <div className="flex w-full h-full bg-white rounded-2xl overflow-hidden">
        <HeaderChat name="đạt ngu" status="onl"/>
        <Info />
      </div>
    </div>
  );
}
