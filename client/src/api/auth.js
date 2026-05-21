import { AUTH_API } from "../config/api.js";

const TOKEN_KEY = "medroute_token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthHeaders(extra = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function isVerifiedGoogleUser(user) {
  return Boolean(user?.authProvider === "google" && user?.googleId);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function authFetch(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${AUTH_API}${path}`, { ...options, headers });
  } catch {
    const hint =
      AUTH_API.startsWith("http") && !AUTH_API.includes("localhost")
        ? " Check client/.env: VITE_API_BASE must match your Mac's current Wi‑Fi IP, or leave it unset when using localhost in the browser."
        : "";
    throw new Error(
      `Cannot reach the API server. In one terminal run: cd server && npm start.${hint}`
    );
  }

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(
      data.error ||
        (raw && !raw.startsWith("{") ? raw.slice(0, 200) : null) ||
        `Request failed (${response.status})`
    );
  }
  return data;
}

export async function registerAccount(body) {
  const data = await authFetch("/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
  setStoredToken(data.token);
  return data.user;
}

export async function loginAccount(body) {
  const data = await authFetch("/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
  setStoredToken(data.token);
  return data.user;
}

export async function loginWithGoogle(credential) {
  const data = await authFetch("/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  setStoredToken(data.token);
  return data.user;
}

export async function fetchCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const data = await authFetch("/me");
    if (!isVerifiedGoogleUser(data.user)) {
      setStoredToken(null);
      return null;
    }
    return data.user;
  } catch {
    setStoredToken(null);
    return null;
  }
}

export function logoutLocal() {
  setStoredToken(null);
}
