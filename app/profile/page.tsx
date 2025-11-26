"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../Components/Button";
import { apiGet, apiPatch } from "../utils/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        const data = await apiGet("/api/profile/");
        setProfile(data);
        setEmail(data.email || "");
        setPublicKey(data.public_key || "");
      } catch (err: any) {
        console.error(err);
        setMessage("⚠️ Unable to load profile");
      }
    }

    fetchProfile();
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      const updated = await apiPatch("/api/profile/", {
        email,
        public_key: publicKey,
      });

      setProfile(updated);
      setMessage("✅ Profile updated successfully!");
    } catch (err: any) {
      setMessage("❌ Error updating profile");
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1E1E2F] px-4">
        <h2 className="text-2xl font-bold text-[#00FFE0]">
          Please log in to view your profile
        </h2>
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
        <h1 className="text-3xl font-extrabold text-center text-[#00FFE0] mb-4">
          User Profile
        </h1>

        <div>
          <label className="block font-semibold mb-1">Username</label>
          <input
            type="text"
            value={profile.username}
            disabled
            className="w-full p-3 rounded-xl bg-white/20 text-white"
          />
        </div>

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
