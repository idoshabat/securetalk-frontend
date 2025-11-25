"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

interface GoogleLoginButtonProps {
  clientId: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleLoginButton({ clientId }: GoogleLoginButtonProps) {
  const { googleLogin } = useAuth();

  // Load the Google script once
  const loadGoogleScript = () => {
    if (!document.getElementById("google-client")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  };

  // Trigger Google OAuth popup
  const handleGoogleLogin = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          await googleLogin(response.credential);
        } catch (err: any) {
          console.error(err);
          alert("Google login failed.");
        }
      },
      ux_mode: "popup",
    });

    window.google.accounts.id.prompt(); // Opens the popup
  };

  // Load script on mount
  useEffect(() => {
    loadGoogleScript();
  }, []);

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full cursor-pointer bg-white text-[#1E1E2F] font-semibold py-3 rounded-xl shadow-lg hover:scale-105 transform transition-all flex items-center justify-center gap-3 border border-gray-200"
    >
      <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
      Continue with Google
    </button>
  );
}
