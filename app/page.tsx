"use client";

import { useAuth } from "./context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E1E2F] px-4">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mt-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#00FFE0] mb-6 tracking-tight">
          Welcome to <span className="text-[#00BFA6]">SecureTalk</span>
        </h1>

        {user ? (
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Hello, <span className="font-semibold text-[#00FFE0]">{user.username}</span>! Ready to chat securely?
          </p>
        ) : (
          <p className="text-lg md:text-xl text-gray-400 mb-8">
            Please log in or sign up to start connecting with friends and colleagues safely.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {user ? (
            <Link
              href="/chat"
              className="px-6 py-3 bg-linear-to-r from-[#00BFA6] to-[#00FFE0] text-[#1E1E2F] font-semibold rounded-xl shadow-lg hover:scale-105 transform transition-all"
            >
              Go to My Chats
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-3 bg-linear-to-r from-[#00BFA6] to-[#00FFE0] text-[#1E1E2F] font-semibold rounded-xl shadow-lg hover:scale-105 transform transition-all"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-[#2E2E3E]/70 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transform transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl">
        {[
          {
            title: "Secure Messaging",
            desc: "End-to-end encryption ensures your conversations stay private.",
            iconColor: "from-[#00BFA6] to-[#00FFE0]",
          },
          {
            title: "Real-Time Chat",
            desc: "Messages update instantly with live notifications for a smooth experience.",
            iconColor: "from-[#FF6FD8] to-[#3813C2]",
          },
          {
            title: "Find Users Easily",
            desc: "Quickly find friends or colleagues and start chatting securely.",
            iconColor: "from-[#FFD166] to-[#EF476F]",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className={`bg-[#2E2E3E]/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 text-center transition hover:scale-105 transform`}
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br ${feature.iconColor} shadow-lg flex items-center justify-center text-white text-2xl font-bold`}>
              {feature.title.charAt(0)}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
            <p className="text-gray-300">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer Illustration */}
      <div className="mt-16">
        <img
          src="/chat.svg" // Save this in your public folder
          alt="Chat Illustration"
          className="w-64 md:w-96 opacity-90 mx-auto"
        />
      </div>
    </div>
  );
}
