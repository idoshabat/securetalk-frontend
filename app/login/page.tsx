"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../Components/Button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { login } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      await login(username, password);
      setMessage("✅ Login successful!");
    } catch (err: any) {
      setMessage("❌ Login failed: " + (err.message || "Unknown error"));
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md flex flex-col gap-4 w-80"
      >
        <h1 className="text-2xl font-bold text-center">Login</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <Button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Log In
        </Button>
      </form>

      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
}
