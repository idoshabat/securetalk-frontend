"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  username?: string;
  sub?: string;
  exp?: number;
}

interface AuthContextType {
  user: string | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  login: async () => { },
  logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const decoded = jwtDecode<JwtPayload>(accessToken);
    if (!decoded.exp) return;

    const expiresIn = decoded.exp * 1000 - Date.now() - 60_000; // refresh 1 min early
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


  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("username"); // 🟢 fallback
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          console.log("Decoded JWT:", decoded);

          const username = decoded.username ?? decoded.sub ?? savedUser ?? null;
          setUser(username);
          setAccessToken(token);
        } catch (err) {
          console.error("JWT decode failed:", err);
          setUser(savedUser ?? null);
          setAccessToken(token);
        }
      } else if (savedUser) {
        setUser(savedUser);
      }
      setIsReady(true);
    }
  }, []);

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
    localStorage.setItem("username", username); // 🟢 store username
    setAccessToken(data.access);

    try {
      const decoded = jwtDecode<JwtPayload>(data.access);
      const decodedUser = decoded.username ?? decoded.sub ?? username;
      setUser(decodedUser);
    } catch {
      setUser(username);
    }

    router.push("/");
  };

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
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
