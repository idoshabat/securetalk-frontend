import { refreshAccessToken } from "./auth";

export async function apiFetch(url: string, options: RequestInit = {}) {
  let accessToken = localStorage.getItem("accessToken");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Access token expired, try refresh
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error("Session expired");

    const retryHeaders = {
      ...options.headers,
      Authorization: `Bearer ${newToken}`,
      "Content-Type": "application/json",
    };

    response = await fetch(url, { ...options, headers: retryHeaders });
  }

  return response;
}
