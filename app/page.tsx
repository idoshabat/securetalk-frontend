"use client";

import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 flex-col gap-4">
      <h1 className="text-4xl font-bold text-blue-600">Welcome to SecureTalk</h1>
      {user ? (
        <p className="text-xl text-gray-700">Hello, {user}!</p>
      ) : (
        <p className="text-gray-500">Please log in or sign up to continue.</p>
      )}
    </div>
  );
}
