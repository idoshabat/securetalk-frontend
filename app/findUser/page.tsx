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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Find User</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Enter username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      {userFound && (
        <div className="bg-white p-4 rounded shadow-md">
          <p>User found: <strong>{userFound.username}</strong></p>
          <Link
            href={`/chat/${userFound.username}`}
            className="mt-2 inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Start Chat
          </Link>
        </div>
      )}
    </div>
  );
}
