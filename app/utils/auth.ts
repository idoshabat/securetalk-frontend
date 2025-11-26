import { apiPost } from "./api";

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    // use apiPost instead of fetch
    const res = await apiPost("http://127.0.0.1:8000/api/token/refresh/", {
      refresh: refreshToken,
    });

    if (!res.ok) {
      console.error("Failed to refresh access token");
      return null;
    }

    const data = await res.json();
    localStorage.setItem("accessToken", data.access);

    return data.access;
  } catch (err) {
    console.error("Error refreshing access token:", err);
    return null;
  }
}
