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
    tempId?: number;
}

export default function ChatPage() {
    const { user, accessToken } = useAuth();
    const router = useRouter();
    const params = useParams();

    const otherUserParam = params.username;
    const otherUser = Array.isArray(otherUserParam) ? otherUserParam[0] : otherUserParam;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const ws = useRef<WebSocket | null>(null);

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
        ws.current.onclose = () => console.log("WebSocket closed");

        ws.current.onmessage = (event) => {
            try {
                const data: Message = JSON.parse(event.data);

                setMessages((prev) => {
                    // Prevent duplicates from optimistic updates
                    if (data.tempId && prev.some((m) => m.tempId === data.tempId)) return prev;

                    return [
                        ...prev,
                        {
                            id: data.id ?? Date.now(),
                            sender: data.sender,
                            receiver: data.receiver ?? otherUser,
                            message: data.message,
                            timestamp: data.timestamp ?? new Date().toISOString(),
                        },
                    ];
                });
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        return () => {
            ws.current?.close();
        };
    }, [otherUser, accessToken]);

    const sendMessage = () => {
        if (!input.trim() || !ws.current) return;

        const messagePayload = { message: input };
        ws.current.send(JSON.stringify(messagePayload));
        setInput("");
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-blue-600 text-white p-4 text-center font-bold text-xl shadow">
                Chat with {otherUser}
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.sender === user;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                                    isMe
                                        ? "bg-blue-500 text-white rounded-br-none"
                                        : "bg-white text-gray-800 rounded-bl-none"
                                }`}
                            >
                                <p className="break-words">{msg.message}</p>
                                <small className="text-xs text-gray-300 mt-1 block text-right">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </small>
                            </div>
                        </div>
                    );
                })}
            </main>

            <footer className="p-4 bg-gray-200 flex items-center gap-2">
                <input
                    className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </footer>
        </div>
    );
}
