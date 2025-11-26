import { refreshAccessToken } from "./auth";

const BASE_URL = "http://127.0.0.1:8000";
// const BASE_URL = "https://securetalk-backend-production.up.railway.app";

async function authorizedFetch(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem("accessToken");

  const headers: any = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Refresh token if needed
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error("Session expired");

    const retryHeaders = {
      ...headers,
      Authorization: `Bearer ${newToken}`,
    };

    response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: retryHeaders,
    });
  }

  return response;
}

// -------------------------------
// PUBLIC METHODS
// -------------------------------

// GET
export async function apiGet(url: string) {
  const res = await authorizedFetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`GET failed: ${res.status}`);
  return res.json();
}

// POST
export async function apiPost(url: string, data: any) {
  const res = await authorizedFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST failed: ${res.status}`);
  return res.json();
}

// PATCH
export async function apiPatch(url: string, data: any) {
  const res = await authorizedFetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
  return res.json();
}

// DELETE
export async function apiDelete(url: string) {
  const res = await authorizedFetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);

  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}
