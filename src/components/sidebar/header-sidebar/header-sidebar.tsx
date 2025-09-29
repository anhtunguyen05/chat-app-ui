import { Icon } from "@/components/icon/icon";

export default function HeaderSidebar() {
  return (
    <div className="flex items-center justify-between p-3 pr-5 pl-5">
      <h1 className="text-2xl font-bold">Đoạn chat</h1>

      <div className="flex items-center gap-3   ">
        <Icon name="ellipsis" buttonClassName="w-9 h-9"></Icon>
        <Icon name="squarePen" buttonClassName="w-9 h-9"></Icon>
      </div>
    </div>
  );
}
