"use client";

import { useState } from "react";
import Button from "../Components/Button";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); 

  async function generateKeyPair() {
    // Generate RSA key pair
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

    // Export public key
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );

    // Convert to base64
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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-6 rounded shadow-md flex flex-col gap-4 w-80"
      >
        <h1 className="text-2xl font-bold text-center">Signup</h1>

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
          Sign Up
        </Button>
      </form>

      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
}
