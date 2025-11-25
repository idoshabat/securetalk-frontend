"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import GoogleLoginButton from "../Components/GoogleLoginButton";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E1E2F] p-6">
      <div className="w-full max-w-md bg-[#2E2E3E]/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-[#ffffff20] text-white">
        <h1 className="text-3xl font-extrabold mb-6 text-center tracking-wider text-[#00FFE0]">
          Welcome Back
        </h1>
        <p className="text-center text-white/70 mb-6">
          Log in to your <span className="text-[#00BFA6] font-semibold">SecureTalk</span> account
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 rounded-xl bg-[#1E1E2F]/50 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00BFA6] transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl bg-[#1E1E2F]/50 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00BFA6] transition"
            required
          />
          <button
            type="submit"
            className="w-full cursor-pointer py-3 bg-linear-to-r from-[#00BFA6] to-[#00FFE0] rounded-xl font-semibold hover:scale-105 transform transition shadow-lg"
          >
            Log In
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-[#FFD166] font-medium">{message}</p>
        )}

        <div className="mt-4 flex justify-center gap-4">
          <GoogleLoginButton clientId="378605525108-f7dmmcusnt63kj4pvepukt0ui9cpv9oq.apps.googleusercontent.com" />
        </div>

        <div className="mt-6 text-center text-white/70">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-[#00BFA6] font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <img src="/login.svg" alt="Login Illustration" className="w-64 md:w-96 opacity-80" />
      </div>
    </div>
  );
}
