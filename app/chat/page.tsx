"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { apiGet } from "@/app/utils/api";

interface ChatItem {
  id: number;
  username: string;
  last_message: string;
  last_message_timestamp: string | null;
  unread: number;
}

export default function ChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [search, setSearch] = useState("");

  async function loadChats() {
    try {
      // No token passing — apiGet handles it
      const data = await apiGet("/api/chats/");

      setChats(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error loading chats:", err);

      if (err.message === "Session expired") {
        router.push("/login");
      }
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
    return new Date(ts).toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen p-6 bg-[#1E1E2F] text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Chats</h1>

      {/* Search bar */}
      <div className="relative w-full max-w-xl mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search for a user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 py-3 rounded-2xl bg-[#2E2E3E] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00BFA6] transition shadow-md"
        />
      </div>

      {/* Chat List */}
      <div className="w-full max-w-xl bg-[#2E2E3E] rounded-2xl divide-y divide-gray-700 shadow-md">
        {filteredChats.map((c) => (
          <Link key={c.id} href={`/chat/${c.username}`}>
            <div className="p-4 flex justify-between items-center hover:bg-[#3A3F5C] transition cursor-pointer rounded-2xl m-1">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#00BFA6] to-[#00FFCA] text-[#1E1E2F] flex items-center justify-center font-bold text-lg shadow-md">
                  {c.username.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col">
                  <p className="text-lg font-semibold">{c.username}</p>
                  <p className="text-sm text-gray-300 max-w-[220px] truncate">
                    {c.last_message || "No messages yet"}
                  </p>
                  {c.last_message_timestamp && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatTimestamp(c.last_message_timestamp)}
                    </p>
                  )}
                </div>
              </div>

              {c.unread > 0 && (
                <div className="bg-[#00BFA6] text-[#1E1E2F] text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  {c.unread}
                </div>
              )}
            </div>
          </Link>
        ))}

        {filteredChats.length === 0 && (
          <p className="text-center p-6 text-gray-400">No chats found.</p>
        )}
      </div>
    </div>
  );
}
