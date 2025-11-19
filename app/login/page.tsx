"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mt-20 max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Log in to your <span className="font-semibold text-indigo-600">SecureTalk</span> account
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-lg shadow-md transition-all"
          >
            Log In
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-700">{message}</p>
        )}

        <div className="mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>

      {/* Optional: subtle illustration */}
      <div className="mt-10">
        <img
          src="/login.svg"
          alt="Login Illustration"
          className="w-64 md:w-96 opacity-80"
        />
      </div>
    </div>
  );
}
