import Image from "next/image";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  avatar?: string;
  replyTo?: string; // nếu có phản hồi tin nhắn
}

const messages: Message[] = [
  {
    id: "1",
    text: "qua trung tú chơi hè",
    sender: "other",
    avatar: "/avatar1.png",
  },
  { id: "2", text: "đang học à", sender: "other" },
  { id: "3", text: "Ok", sender: "me" },
  { id: "4", text: "Mua chai nc ngọt đi", sender: "me" },
  { id: "5", text: "ê còn chỗ ngồi k", sender: "other" },
  { id: "6", text: "😄", sender: "other" },
];

export default function Info() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender === "me" ? "justify-end" : "justify-start"
          }`}
        >
          {/* {msg.sender === "other" && msg.avatar && (
            <Image
              src={msg.avatar}
              alt="avatar"
              width={32}
              height={32}
              className="rounded-full mr-2"
            />
          )} */}

          <div
            className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
              msg.sender === "me"
                ? "bg-violet-600 text-white rounded-br-none"
                : "bg-gray-200 text-black rounded-bl-none"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
