"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "../Components/Button";
import GoogleLoginButton from "../Components/GoogleLoginButton";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );

    return btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const publicKey = await generateKeyPair();

      const res = await fetch("http://127.0.0.1:8000/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, public_key: publicKey }),
      });

      if (!res.ok) {
        let errorMessage = "Signup failed";
        try {
          const errorJson = await res.json();
          const allMessages = Object.values(errorJson)
            .flat()
            .map(String);
          errorMessage = allMessages.join(" | ");
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || res.statusText;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setMessage("✅ Signup successful! You can now log in.");
    } catch (err: any) {
      setMessage("❌ Signup failed: " + err.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E1E2F] p-6">
      <div className="w-full max-w-md bg-[#2E2E3E]/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-[#ffffff20] text-white">
        <h1 className="text-3xl font-extrabold mb-6 text-center tracking-wider text-[#00FFE0]">
          Create Account
        </h1>
        <p className="text-center text-white/70 mb-6">
          Sign up to <span className="text-[#00BFA6] font-semibold">SecureTalk</span> and start chatting securely.
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
            Sign Up
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-[#FFD166] font-medium">{message}</p>
        )}

        <div className="mt-4 flex justify-center gap-4">
          <GoogleLoginButton clientId="378605525108-f7dmmcusnt63kj4pvepukt0ui9cpv9oq.apps.googleusercontent.com" />
        </div>

        <div className="mt-6 text-center text-white/70">
          Already have an account?{" "}
          <Link href="/login" className="text-[#00BFA6] font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <img src="/signup.svg" alt="Signup Illustration" className="w-64 md:w-96 opacity-80" />
      </div>
    </div>
  );
}
