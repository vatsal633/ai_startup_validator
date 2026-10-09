// Token storage and JWT helpers.
//
// Tokens live in localStorage, so every read is guarded for SSR, where there
// is no window. Nothing here talks to the network — see lib/api.js for that.

import { jwtDecode } from "jwt-decode";

export const ACCESS_KEY = "access_token";
export const REFRESH_KEY = "refresh_token";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACCESS_KEY);
  } catch {
    return null; // private mode / blocked storage
  }
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setTokens({ access, refresh }) {
  if (typeof window === "undefined") return;
  try {
    if (access) window.localStorage.setItem(ACCESS_KEY, access);
    // refresh rotation is on server-side, so a refresh call returns a new one too
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
  } catch {
    /* storage unavailable — the session just won't survive a reload */
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* nothing to do */
  }
}

/** Decoded access-token payload, or null if missing/corrupt. */
export function getTokenPayload() {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

/** The backend embeds role and email in the JWT, so the common case needs no API call. */
export function getRole() {
  return getTokenPayload()?.role ?? null;
}

export function getEmail() {
  return getTokenPayload()?.email ?? null;
}

export function isExpired(token, skewSeconds = 0) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return false; // no expiry claim — treat as usable
    return Date.now() >= (exp - skewSeconds) * 1000;
  } catch {
    return true;
  }
}

/** True when there is an access token that hasn't expired, or a refresh token to trade in. */
export function isAuthenticated() {
  const access = getAccessToken();
  if (access && !isExpired(access)) return true;
  return Boolean(getRefreshToken()) && !isExpired(getRefreshToken());
}

/** Where a role belongs after signing in. */
export function homePathForRole(role) {
  switch (role) {
    case "founder":
      return "/founder/dashboard";
    case "investor":
      return "/investor/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}
