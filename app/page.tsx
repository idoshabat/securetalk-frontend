"use client";

import { useAuth } from "./context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 px-4">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mt-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
          Welcome to <span className="text-indigo-600">SecureTalk</span>
        </h1>
        {user ? (
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Hello, <span className="font-semibold">{user}</span>! Ready to chat securely?
          </p>
        ) : (
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Please log in or sign up to start connecting with friends and colleagues safely.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {user ? (
            <Link
              href="/chat"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              Go to My Chats
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl">
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
          <h3 className="text-xl font-bold mb-2">Secure Messaging</h3>
          <p className="text-gray-600">
            End-to-end encryption ensures your conversations stay private.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
          <h3 className="text-xl font-bold mb-2">Real-Time Chat</h3>
          <p className="text-gray-600">
            Messages update instantly with live notifications for a smooth experience.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
          <h3 className="text-xl font-bold mb-2">Find Users Easily</h3>
          <p className="text-gray-600">
            Quickly find friends or colleagues and start chatting securely.
          </p>
        </div>
      </div>

      {/* Footer Illustration */}
      <div className="mt-16">
        <img
          src="/chat.svg" // Save this file in your public folder
          alt="Chat Illustration"
          className="w-64 md:w-96 opacity-90 mx-auto"
        />
      </div>
    </div>
  );
}
