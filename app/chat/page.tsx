"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

interface ChatItem {
  id: number;
  username: string;
  last_message: string;
  last_message_timestamp: string | null;
  unread: number;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [search, setSearch] = useState("");

  async function loadChats() {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://127.0.0.1:8000/api/chats/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error("Error loading chats:", err);
    }
  }

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredChats = chats.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  function formatTimestamp(ts: string | null) {
    if (!ts) return "";
    return new Date(ts).toLocaleString();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Chats</h1>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search for a user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
        />
      </div>

      {/* Chat List */}
      <div className="bg-white shadow rounded-xl divide-y">
        {filteredChats.map((c) => (
          <Link key={c.id} href={`/chat/${c.username}`}>
            <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition cursor-pointer">
              <div className="flex items-center space-x-4">
                {/* Avatar circle */}
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow">
                  {c.username.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {c.username}
                  </p>

                  {/* Last message preview */}
                  <p className="text-sm text-gray-600 max-w-[220px] truncate">
                    {c.last_message || "No messages yet"}
                  </p>

                  {/* Timestamp */}
                  {c.last_message_timestamp && (
                    <p className="text-xs text-gray-400">
                      {formatTimestamp(c.last_message_timestamp)}
                    </p>
                  )}
                </div>
              </div>

              {/* Unread badge */}
              {c.unread > 0 && (
                <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow">
                  {c.unread}
                </div>
              )}
            </div>
          </Link>
        ))}

        {filteredChats.length === 0 && (
          <p className="text-center p-6 text-gray-500">No chats found.</p>
        )}
      </div>
    </div>
  );
}
