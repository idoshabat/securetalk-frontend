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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-xl font-bold">Please log in to view your profile</h2>
        <Button onClick={logout} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Go to Login
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded shadow-md flex flex-col gap-4 w-96"
      >
        <h1 className="text-2xl font-bold text-center">User Profile</h1>

        <div>
          <label className="block font-semibold">Username</label>
          <input
            type="text"
            value={profile.username}
            disabled
            className="border p-2 rounded w-full bg-gray-200"
          />
        </div>

        {/* <div>
          <label className="block font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Public Key</label>
          <textarea
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="border p-2 rounded w-full h-32"
          />
        </div> */}

        <Button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded"
        >
          Save Changes
        </Button>
      </form>

      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
}
