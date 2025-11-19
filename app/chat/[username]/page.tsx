"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, UserCircle } from "lucide-react";

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
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    if (!user) {
        router.push("/login");
        return null;
    }

    if (!otherUser || !accessToken) {
        return <div>Loading...</div>;
    }

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/profile/${otherUser}/`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }, [otherUser, accessToken, router]);

    // Load initial chat history
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/messages/${otherUser}/`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setMessages(data));
    }, [otherUser, accessToken]);

    // WebSocket setup
    useEffect(() => {
        const protocol = location.protocol === "https:" ? "wss" : "ws";
        const tokenParam = encodeURIComponent(accessToken);
        const wsUrl = `${protocol}://127.0.0.1:8000/ws/chat/${otherUser}/?token=${tokenParam}`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            setMessages((prev) => [
                ...prev,
                {
                    id: data.id ?? Date.now(),
                    sender: data.sender,
                    receiver: data.receiver ?? otherUser,
                    message: data.message,
                    timestamp: data.timestamp ?? new Date().toISOString(),
                },
            ]);
        };

        return () => ws.current?.close();
    }, [otherUser, accessToken]);

    // Scroll to bottom on message updates
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || !ws.current) return;
        ws.current.send(JSON.stringify({ message: input }));
        setInput("");
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">

            {/* HEADER */}
            <header className="bg-blue-600 text-white px-4 py-3 flex items-center shadow-md">
                <button
                    onClick={() => router.back()}
                    className="mr-3 hover:text-gray-200 cursor-pointer"
                >
                    <ArrowLeft size={24} />
                </button>

                <UserCircle className="mr-3" size={40} />

                <div>
                    <p className="text-lg font-semibold">{otherUser}</p>
                    <p className="text-sm text-blue-200">Online</p>
                </div>
            </header>

            {/* MESSAGES */}
            <main className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                    const isMe = msg.sender === user;

                    return (
                        <div
                            key={msg.id}
                            className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}
                        >
                            <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md ${
                                    isMe
                                        ? "bg-blue-500 text-white rounded-br-none"
                                        : "bg-white text-gray-800 rounded-bl-none"
                                }`}
                            >
                                <p>{msg.message}</p>
                                <p className="text-[10px] opacity-70 text-right mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </main>

            {/* INPUT BAR */}
            <footer className="p-3 bg-white shadow-inner flex items-center gap-2 border-t">
                <input
                    className="flex-1 border rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow"
                    onClick={sendMessage}
                >
                    <Send className="cursor-pointer" size={18} />
                </button>
            </footer>
        </div>
    );
}
