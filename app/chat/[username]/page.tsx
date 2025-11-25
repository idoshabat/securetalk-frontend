"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useParams } from "next/navigation";

interface Message {
  id: number;
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
  status?: "sent" | "delivered" | "seen";
  tempId?: number;
}

export default function ChatPage() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const params = useParams();

  const otherUserParam = params.username;
  const rawOtherUser = Array.isArray(otherUserParam) ? otherUserParam[0] : otherUserParam;
  const otherUser = rawOtherUser ? decodeURIComponent(rawOtherUser) : undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pendingReadIds = useRef<number[]>([]);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user || !accessToken) return <div className="p-4 text-white">Loading chat...</div>;
  if (!otherUser) return <div className="p-4 text-white">Loading...</div>;

  // Load old messages
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/messages/${otherUser}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data: Message[]) => setMessages(data))
      .catch((err) => console.error("Failed to load messages:", err));
  }, [otherUser, accessToken]);

  // WebSocket setup
  useEffect(() => {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://127.0.0.1:8000/ws/chat/${otherUser}/?token=${encodeURIComponent(
      accessToken
    )}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "typing" && data.username === otherUser) {
        setOtherUserTyping(data.typing);
        return;
      }

      if (data.type === "read_receipt") {
        setMessages((prev) =>
          prev.map((m) => (data.ids.includes(m.id) ? { ...m, status: "seen" } : m))
        );
        return;
      }

      const isIncoming = data.sender === otherUser;

      if (isIncoming && data.id) {
        pendingReadIds.current.push(data.id);
        setTimeout(() => {
          if (pendingReadIds.current.length > 0) {
            ws.current?.send(
              JSON.stringify({ type: "read_messages", ids: pendingReadIds.current })
            );
            pendingReadIds.current = [];
          }
        }, 150);
      }

      setMessages((prev) => {
        const updated = [...prev];
        const tempIndex = updated.findIndex((m) => m.tempId && m.tempId === data.tempId);
        if (tempIndex !== -1) {
          updated[tempIndex] = { ...updated[tempIndex], ...data };
          return updated;
        }
        const realIndex = updated.findIndex((m) => m.id === data.id);
        if (realIndex !== -1) {
          updated[realIndex] = { ...updated[realIndex], ...data };
          return updated;
        }
        updated.push(data);
        return updated;
      });
    };

    return () => ws.current?.close();
  }, [otherUser, accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: user.username,
        receiver: otherUser,
        message: input,
        timestamp: new Date().toISOString(),
        status: "sent",
        tempId,
      },
    ]);
    ws.current?.send(JSON.stringify({ message: input, tempId }));
    ws.current?.send(JSON.stringify({ type: "stop_typing" }));
    setInput("");
  };

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  let lastDate = "";

  return (
    <div className="flex flex-col h-screen bg-[#1E1E2F]">
      {/* HEADER */}
      <header className="bg-[#2E2E3E]/90 backdrop-blur-md shadow-md flex items-center p-4 gap-4 text-white font-semibold sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="text-white bg-[#00BFA6]/80 hover:bg-[#00BFA6]/60 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow transition"
        >
          ←
        </button>
        <h1 className="flex-1 text-center text-xl sm:text-2xl">{otherUser}</h1>
      </header>

      {/* MESSAGES */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const isMe = m.sender === user.username;
          const msgDate = formatDate(m.timestamp);
          const showDate = lastDate !== msgDate;
          lastDate = msgDate;

          return (
            <div key={m.id ?? m.tempId ?? i}>
              {showDate && (
                <div className="text-center text-[#AAAAAA] text-sm my-2 font-medium">{msgDate}</div>
              )}

              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative max-w-[75%] px-5 py-3 rounded-3xl shadow-lg 
                  ${isMe ? "bg-[#3A3F5C] text-white" : "bg-[#2E2E3E] text-white/90"} 
                  transition-all duration-300`}
                >
                  <p className="wrap-break-words">{m.message}</p>
                  <div className="text-[11px] opacity-70 mt-1 flex justify-between items-center">
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {isMe && (
                      <span>
                        {m.status === "sent" && "✓"}
                        {m.status === "delivered" && "✓✓"}
                        {m.status === "seen" && <span className="text-[#00BFA6]">✓✓</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing animation */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="px-5 py-3 rounded-3xl bg-[#2E2E3E] shadow flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 bg-[#00BFA6] rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-[#00BFA6] rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-[#00BFA6] rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* INPUT */}
      <footer className="p-4 bg-[#2E2E3E]/90 backdrop-blur-md flex items-center gap-3 sticky bottom-0 z-10">
        <input
          className="flex-1 px-4 py-3 rounded-2xl bg-[#3A3F5C] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00BFA6] transition"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            ws.current?.send(JSON.stringify({ type: "typing" }));
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button
          className="bg-[#00BFA6] text-[#1E1E2F] px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transform transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </footer>
    </div>
  );
}
