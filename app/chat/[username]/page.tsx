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
    // FIX: decode %40 -> @
    const rawOtherUser = Array.isArray(otherUserParam) ? otherUserParam[0] : otherUserParam;
    const otherUser = rawOtherUser ? decodeURIComponent(rawOtherUser) : undefined;


    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [otherUserOnline, setOtherUserOnline] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);

    const ws = useRef<WebSocket | null>(null);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    if (!user) {
        router.push("/login");
        return null;
    }

    if (!otherUser || !accessToken) {
        return <div>Loading...</div>;
    }

    // Fetch existing messages
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/messages/${otherUser}/`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
                return res.json();
            })
            .then((data: Message[]) => setMessages(data))
            .catch((err) => console.error(err));
    }, [otherUser, accessToken]);

    // Initialize WebSocket
    useEffect(() => {
        const protocol = location.protocol === "https:" ? "wss" : "ws";
        const tokenParam = encodeURIComponent(accessToken);
        const wsUrl = `${protocol}://127.0.0.1:8000/ws/chat/${otherUser}/?token=${tokenParam}`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => console.log("WebSocket connected");

        ws.current.onclose = () => {
            console.log("WebSocket closed");
            setOtherUserOnline(false);
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WebSocket message received:", data);

                // typing indicator
                if (data.type === "typing") {
                    console.log(data.username + ' is typing');
                    console.log(otherUser);
                    if (data.username === otherUser) {
                        console.log('typingggggg');
                        setOtherUserTyping(data.typing);
                    }
                    return;
                }

                // Online indicator
                if (data.type === "user_active") {
                    setOtherUserOnline(data.username === otherUser && data.active);
                    return;
                }

                // Read receipts
                setMessages((prev) => {
                    if (data.type === "read_receipt") {
                        return prev.map((m) =>
                            m.sender === user && m.receiver === data.reader
                                ? { ...m, status: "seen" }
                                : m
                        );
                    }

                    const updated = prev.map((m) => {
                        if (data.id && m.id === data.id) return { ...m, ...data };
                        if (data.tempId && m.tempId === data.tempId) return { ...m, ...data };
                        return m;
                    });

                    const exists = updated.some(
                        (m) => (data.id && m.id === data.id) || (data.tempId && m.tempId === data.tempId)
                    );
                    if (!exists && !data.type) updated.push(data);

                    return updated;
                });
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        return () => ws.current?.close();
    }, [otherUser, accessToken, user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || !ws.current) return;

        const tempId = Date.now();

        setMessages((prev) => [
            ...prev,
            {
                id: tempId,
                sender: user,
                receiver: otherUser,
                message: input,
                timestamp: new Date().toISOString(),
                status: "sent",
                tempId,
            },
        ]);

        ws.current.send(JSON.stringify({ message: input, tempId }));

        setInput("");

        // stop typing event immediately
        ws.current.send(JSON.stringify({ type: "stop_typing" }));
    };

    // Helper to format date separators
    const formatDate = (timestamp: string) => {
        const d = new Date(timestamp);
        return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    };

    let lastDate = "";

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* HEADER */}
            <header className="bg-indigo-600 text-white p-3 shadow flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    aria-label="Go back"
                    className="text-white bg-indigo-500 hover:bg-indigo-400 rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                >
                    ←
                </button>

                <div className="flex-1 flex flex-col items-center">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <span>{otherUser}</span>
                        {otherUserOnline && <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>}
                    </div>

                    {/* {otherUserTyping && (
                        <div className="flex justify-start mb-2">
                            <div className="typing-bubble bubble-animate">
                                typing...
                            </div>
                        </div>
                    )} */}

                </div>
            </header>

            {/* MESSAGES */}
            <main className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => {
                    const isMe = msg.sender === user;
                    const key = msg.id ?? msg.tempId ?? index;

                    const msgDate = formatDate(msg.timestamp);
                    const showDate = lastDate !== msgDate;
                    lastDate = msgDate;

                    return (
                        <div key={key}>
                            {showDate && (
                                <div className="text-center text-gray-400 text-sm my-2">
                                    {msgDate}
                                </div>
                            )}
                            <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm wrap-break-words bubble-animate ${isMe
                                        ? "bg-indigo-400 text-white rounded-br-none"
                                        : "bg-white text-gray-900 rounded-bl-none"
                                        }`}
                                >
                                    <p>{msg.message}</p>
                                    <div className="flex justify-between items-center mt-1 text-[11px] opacity-80">
                                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        {isMe && (
                                            <span className="ml-2">
                                                {msg.status === "sent" && "✓"}
                                                {msg.status === "delivered" && "✓✓"}
                                                {msg.status === "seen" && <span className="text-blue-700">✓✓</span>}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Typing bubble as a fake message */}
                {otherUserTyping && (
                    <div className="flex justify-start">
                        <div className="max-w-[40%] px-4 py-2 rounded-2xl shadow-sm wrap-break-words bubble-animate bg-white text-gray-900 rounded-bl-none">
                            <div className="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}


                <div ref={messagesEndRef} />
            </main>


            {/* FOOTER */}
            <footer className="p-3 bg-gray-100 flex items-center gap-3 border-t border-gray-300">
                <input
                    className="flex-1 border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);

                        if (!ws.current) return;

                        ws.current.send(JSON.stringify({ type: "typing" }));

                        if (typingTimeout.current) clearTimeout(typingTimeout.current);
                        typingTimeout.current = setTimeout(() => {
                            ws.current?.send(JSON.stringify({ type: "stop_typing" }));
                        }, 1500);
                    }}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </footer>
        </div>
    );
}
