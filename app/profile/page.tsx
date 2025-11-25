"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../Components/Button";

export default function ProfilePage() {
  const { accessToken, user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    async function fetchProfile() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/profile/", {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
        setEmail(data.email || "");
        setPublicKey(data.public_key || "");
      } catch (err: any) {
        console.error(err);
        setMessage("⚠️ Unable to load profile");
      }
    }

    fetchProfile();
  }, [accessToken]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/profile/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email,
          public_key: publicKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(JSON.stringify(data));
      }

      const updated = await res.json();
      setProfile(updated);
      setMessage("✅ Profile updated successfully!");
    } catch (err: any) {
      setMessage("❌ Error updating profile: " + err.message);
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1E1E2F] px-4">
        <h2 className="text-2xl font-bold text-[#00FFE0]">Please log in to view your profile</h2>
        <Button onClick={logout} className="mt-4 bg-linear-to-r from-[#00BFA6] to-[#00FFE0] text-[#1E1E2F] px-6 py-3 rounded-xl shadow-lg hover:scale-105 transform transition-all">
          Go to Login
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1E1E2F] px-4 text-[#00FFE0]">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E1E2F] px-4">
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8 flex flex-col gap-6 text-white"
      >
        <h1 className="text-3xl font-extrabold text-center text-[#00FFE0] mb-4">User Profile</h1>

        <div>
          <label className="block font-semibold mb-1">Username</label>
          <input
            type="text"
            value={profile.username}
            disabled
            className="w-full p-3 rounded-xl bg-white/20 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-[#00BFA6] border border-white/20"
          />
        </div>

        {/* Uncomment if you want editable email & public key
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/20 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-[#00BFA6] border border-white/20"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Public Key</label>
          <textarea
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/20 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-[#00BFA6] border border-white/20 h-32 resize-none"
          />
        </div>
        */}

        <Button
          type="submit"
          className="bg-linear-to-r from-[#00BFA6] to-[#00FFE0] text-[#1E1E2F] font-semibold py-3 rounded-xl shadow-lg hover:scale-105 transform transition-all"
        >
          Save Changes
        </Button>

        {message && (
          <p className="mt-2 text-center text-sm text-[#FFD166]">{message}</p>
        )}
      </form>
    </div>
  );
}
