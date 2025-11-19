"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "../Components/Button";

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

    const publicKeyBase64 = btoa(
      String.fromCharCode(...new Uint8Array(exportedPublicKey))
    );

    return publicKeyBase64;
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

      if (!res.ok) throw new Error("Signup failed");
      setMessage("✅ Signup successful! You can now log in.");
    } catch (err: any) {
      setMessage("❌ Signup failed: " + err.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mt-20 max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
          Create Account
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Sign up to <span className="font-semibold text-indigo-600">SecureTalk</span> and start chatting securely.
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
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

          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-lg shadow-md transition-all"
          >
            Sign Up
          </Button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-700">{message}</p>
        )}

        <div className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </div>

      {/* Optional illustration */}
      <div className="mt-10">
        <img
          src="/signup.svg"
          alt="Signup Illustration"
          className="w-64 md:w-96 opacity-80"
        />
      </div>
    </div>
  );
}
