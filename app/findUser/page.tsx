"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function FindUserPage() {
  const [search, setSearch] = useState("");
  const [userFound, setUserFound] = useState<{ username: string } | null>(null);
  const [error, setError] = useState("");
  const { accessToken } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFound(null);
    setError("");

    if (!search.trim()) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/profile/${search}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 404) {
        setError("User not found");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setUserFound({ username: data.username });
    } catch (err: any) {
      setError("Error fetching user: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E1E2F] p-6">
      <div className="w-full max-w-md bg-[#2E2E3E]/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-[#ffffff20] text-white">
        <h1 className="text-3xl font-extrabold mb-6 text-center tracking-wider text-[#00FFE0]">
          Find User
        </h1>

        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-3 rounded-xl bg-[#1E1E2F]/50 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00BFA6] transition"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-linear-to-r from-[#00BFA6] to-[#00FFE0] rounded-xl font-semibold hover:scale-105 transform transition shadow-lg"
          >
            Search
          </button>
        </form>

        {error && (
          <p className="text-red-400 mt-4 text-center font-medium">{error}</p>
        )}

        {userFound && (
          <div className="mt-6 bg-[#2E2E3E]/50 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-[#ffffff30] text-center transition hover:scale-105 transform">
            <p className="text-lg font-semibold mb-3">
              User found: <span className="text-[#00FFE0]">{userFound.username}</span>
            </p>
            <Link
              href={`/chat/${userFound.username}`}
              className="inline-block bg-[#00BFA6]/90 hover:bg-[#00FFE0]/90 text-[#1E1E2F] font-medium px-6 py-3 rounded-xl shadow-md transition transform hover:scale-105"
            >
              Start Chat
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
