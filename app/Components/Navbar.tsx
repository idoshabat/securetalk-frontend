"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <Link href="/" className="text-white text-3xl font-bold">
        SecureTalk
      </Link>

      <div className="flex gap-4">
        {user ? (
          <>
            <div className="items-center mx-auto flex gap-4">
              <Link href="/profile" className="text-white">
                Profile
              </Link>

              <Link href="/findUser" className="text-white">
                Find User
              </Link>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-white">
              Login
            </Link>
            <Link href="/signup" className="text-white">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
