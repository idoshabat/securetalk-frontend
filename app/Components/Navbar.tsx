"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gray-900 shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo left */}
          <div className="shrink-0">
            <Link
              href="/"
              className="text-white text-3xl font-bold hover:text-indigo-400 transition-colors"
            >
              SecureTalk
            </Link>
          </div>

          {/* Center links (desktop only) */}
          <div className="hidden md:flex flex-1 justify-center gap-8">
            <Link href="/profile" className="text-white hover:text-indigo-400 transition-colors">
              Profile
            </Link>
            <Link href="/chat" className="text-white hover:text-indigo-400 transition-colors">
              My Chats
            </Link>
            <Link href="/findUser" className="text-white hover:text-indigo-400 transition-colors">
              Find User
            </Link>
          </div>

          {/* User actions right (desktop only) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-indigo-400 transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-md p-2"
            >
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 px-4 pt-2 pb-4 space-y-2">
          <Link href="/profile" className="block text-white hover:text-indigo-400 transition-colors">
            Profile
          </Link>
          <Link href="/chat" className="block text-white hover:text-indigo-400 transition-colors">
            My Chats
          </Link>
          <Link href="/findUser" className="block text-white hover:text-indigo-400 transition-colors">
            Find User
          </Link>
          {user ? (
            <button
              onClick={logout}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="block text-white hover:text-indigo-400 transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
