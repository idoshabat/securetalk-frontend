"use client";

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

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

  useEffect(() => {
    if (!document.getElementById("google-client")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = renderGoogle;
    } else {
      renderGoogle();
    }

    function renderGoogle() {
      if (!window.google) return;

      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.setLogLevel("debug");

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            await googleLogin(response.credential);
          } catch (error: any) {
            console.error(error);
            alert("Google login failed.");
          }
        },
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignIn")!,
        {
          theme: "outline",
          size: "large",
          width: 300,
        }
      );
    }
  }, [clientId]);

  return (
    <div className="w-full flex justify-center mt-2">
      <div className="p-1 rounded-xl shadow-lg bg-[#1E1E2F]/20 backdrop-blur-sm">
        <div id="googleSignIn" style={{ minWidth: 300, minHeight: 50 }}></div>
      </div>
    </div>
  );
}
