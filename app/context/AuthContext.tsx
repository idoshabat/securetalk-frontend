"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { apiPost } from "../utils/api";

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
  login: async () => {},
  logout: () => {},
  googleLogin: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUsername = localStorage.getItem("username");

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const username = decoded.username ?? decoded.sub ?? savedUsername ?? null;

        if (username) setUser({ username });
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

  // Auto refresh JWT tokens
  useEffect(() => {
    if (!accessToken) return;

    const decoded = jwtDecode<JwtPayload>(accessToken);
    if (!decoded.exp) return;

    const expiresIn = decoded.exp * 1000 - Date.now() - 60_000; // 1 min before expiry

    const timer = setTimeout(async () => {
      try {
        const data = await apiPost("/api/token/refresh/", {
          refresh: localStorage.getItem("refreshToken"),
        });

        localStorage.setItem("accessToken", data.access);
        setAccessToken(data.access);
      } catch {
        logout();
      }
    }, Math.max(expiresIn, 0));

    return () => clearTimeout(timer);
  }, [accessToken]);

  // Regular login
  const login = async (username: string, password: string) => {
    const data = await apiPost("/api/login/", { username, password });

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("username", username);

    setAccessToken(data.access);
    setUser({ username });

    router.push("/");
  };

  // Google Login
  const googleLogin = async (credential: string) => {
    const data = await apiPost("/api/google-auth/", { credential });

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("username", data.email);

    setAccessToken(data.access);
    setUser({ username: data.email, email: data.email });

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
    <AuthContext.Provider value={{ user, accessToken, login, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
