"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  username?: string;
  sub?: string;
  exp?: number;
}

interface User {
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  login: async () => { },
  logout: () => { },
  googleLogin: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Auto refresh JWT tokens
  useEffect(() => {
    if (!accessToken) return;

    const decoded = jwtDecode<JwtPayload>(accessToken);
    if (!decoded.exp) return;

    const expiresIn = decoded.exp * 1000 - Date.now() - 60_000;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: localStorage.getItem("refreshToken") }),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("accessToken", data.access);
          setAccessToken(data.access);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }, Math.max(expiresIn, 0));

    return () => clearTimeout(timer);
  }, [accessToken]);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUsername = localStorage.getItem("username");

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const username = decoded.username ?? decoded.sub ?? savedUsername ?? null;

        if (username) {
          setUser({ username });
        }

        setAccessToken(token);
      } catch {
        setUser(savedUsername ? { username: savedUsername } : null);
        setAccessToken(token);
      }
    } else if (savedUsername) {
      setUser({ username: savedUsername });
    }

    setIsReady(true);
  }, []);

  // Regular login
  const login = async (username: string, password: string) => {
    const res = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Login failed");
    }

    const data = await res.json();

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("username", username);

    setAccessToken(data.access);
    setUser({ username });
    router.push("/");
  };

  // Google Login
  // AuthContext.tsx
  async function googleLogin(credential: string) {
    const res = await fetch("http://127.0.0.1:8000/api/google-auth/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Google login failed");
    }

    const data = await res.json();

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("username", data.email);

    setAccessToken(data.access);
    setUser({ username: data.email, email: data.email });

    router.push("/");
  }


  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");

    setUser(null);
    setAccessToken(null);

    router.push("/login");
  };

  if (!isReady) return null;

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, googleLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
