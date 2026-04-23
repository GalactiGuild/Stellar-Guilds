import React from "react";
import { Message } from "@/features/social/types";

interface ChatWindowProps {
  messages: Message[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex flex-col space-y-2 p-4 border rounded-lg h-full overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={
            "p-2 rounded-lg " +
            (msg.from === "me" ? "bg-blue-100 self-end" : "bg-slate-800/50 self-start")
          }
        >
          <div className="text-sm text-gray-700">{msg.body}</div>
          <div className="text-xs text-gray-400 text-right">{msg.timestamp}</div>
        </div>
      ))}
    </div>
  );
};