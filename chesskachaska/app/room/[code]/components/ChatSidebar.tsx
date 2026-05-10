"use client";

import { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/app/store/hooks";
import { selectMessages, selectTypingUsers } from "@/app/store/chatSlice";
import { useChat } from "@/app/hooks/useChat";
import { MoveRecord } from "@/app/store/roomSlice";

type Props = {
  roomCode: string;
  moveHistory: MoveRecord[];
};

export default function ChatSidebar({ roomCode, moveHistory }: Props) {
  const [activeTab, setActiveTab] = useState<"chat" | "moves">("chat");
  const [msgInput, setMsgInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useAppSelector(selectMessages);
  const typingUsers = useAppSelector(selectTypingUsers);
  const { sendMessage, sendTyping } = useChat(roomCode);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    sendMessage(msgInput);
    setMsgInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") {
      sendTyping();
    }
  };

  const renderMoves = () => {
    const rows = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      rows.push(
        <div key={i} className="grid grid-cols-[42px,1fr,1fr] text-sm font-mono gap-y-2 gap-x-3 py-1 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition">
          <span className="text-gray-400">{Math.floor(i / 2) + 1}.</span>
          <span className="text-gray-200">{moveHistory[i].san}</span>
          <span className="text-gray-200">{moveHistory[i + 1]?.san || ""}</span>
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="w-full max-w-[380px] lg:h-[720px] flex flex-col bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-4 text-sm font-semibold transition ${
            activeTab === "chat" ? "text-accent border-b-2 border-accent" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Room Chat
        </button>
        <button
          onClick={() => setActiveTab("moves")}
          className={`flex-1 py-4 text-sm font-semibold transition ${
            activeTab === "moves" ? "text-accent border-b-2 border-accent" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Notation
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-8">
                No messages yet. Say hi!
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="font-bold text-indigo-300 mr-2">{m.username}</span>
                  <span className="text-gray-200 break-words">{m.message}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 italic">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </div>
          )}

          {/* Chat Input */}
          <div className="p-4 bg-white/5 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message room..."
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!msgInput.trim()}
                className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {moveHistory.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-8">
              Game hasn't started yet.
            </div>
          ) : (
            <div className="space-y-1">{renderMoves()}</div>
          )}
        </div>
      )}
    </div>
  );
}
