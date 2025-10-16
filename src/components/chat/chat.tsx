import HeaderChat from "@/components/chat/header-chat/header-chat";
import Info from "@/components/chat/info/info";
import InputChat from "@/components/chat/input-chat/input-chat";

export default function Chat() {
  return (
    <div className=" flex-1 bg-neutral-100 p-4">
      <div className="flex flex-col w-full h-full bg-white rounded-2xl overflow-hidden">
        <HeaderChat name="đạt ngu" status="onl"/>
        <Info />
        <InputChat/>
      </div>
    </div>
  );
}
