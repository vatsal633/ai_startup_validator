// The single place the app talks to the Django API.
//
// Handles bearer auth, refreshes an expired access token once per request,
// and turns DRF's error shapes into a thrown ApiError with a readable message.

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isExpired,
  setTokens,
} from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/** "current_password" -> "Current password" */
function humanizeField(field) {
  const words = field.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** DRF returns {detail}, {field: [msgs]}, or a bare list. Produce something showable. */
function messageFromErrorBody(body, fallback) {
  if (!body) return fallback;
  if (typeof body === "string") return body;
  if (body.detail) return body.detail;

  if (Array.isArray(body)) return body.join(" ");

  const entries = Object.entries(body);
  if (entries.length === 0) return fallback;

  const asText = ([, value]) => (Array.isArray(value) ? value.join(" ") : String(value));

  // A single field's message usually names its own subject already ("Current
  // password is incorrect"), so prefixing it with the raw field key just leaks
  // the API's naming at the user. Only label fields when there are several and
  // the reader would not otherwise know which one failed.
  if (entries.length === 1) return asText(entries[0]);

  return entries
    .map(([field, value]) =>
      field === "non_field_errors"
        ? asText([field, value])
        : `${humanizeField(field)}: ${asText([field, value])}`
    )
    .join(" ");
}

function redirectToLogin() {
  clearTokens();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

// One refresh at a time: several 401s firing at once should wait on the same
// request rather than each spending the (single-use, rotating) refresh token.
let refreshInFlight = null;

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh || isExpired(refresh)) return null;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
        if (!res.ok) return null;

        const data = await res.json();
        // rotation is enabled server-side, so this also returns a new refresh token
        setTokens({ access: data.access, refresh: data.refresh });
        return data.access;
      } catch {
        return null; // offline or CORS — treat as a failed refresh
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

/**
 * Call the API.
 *
 * @param {string} endpoint  path beginning with "/", e.g. "/api/ideas/"
 * @param {object} options
 *   - body: plain object, JSON-encoded automatically
 *   - auth: false for genuinely public calls (login, register, marketplace)
 *   - raw:  true to get the Response back instead of parsed JSON
 */
export async function apiFetch(endpoint, options = {}) {
  const { body, auth = true, raw = false, headers: extraHeaders, ...rest } = options;

  if (!API_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not set — check client/.env.local.",
      { status: 0 }
    );
  }

  const send = async (token) => {
    const headers = {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    };

    return fetch(`${API_URL}${endpoint}`, {
      ...rest,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  };

  let token = auth ? getAccessToken() : null;

  // refresh up front when we can already see the token is spent, so the common
  // case costs one request rather than a guaranteed 401 then a retry
  if (auth && token && isExpired(token, 10)) {
    token = (await refreshAccessToken()) ?? token;
  }

  let res;
  try {
    res = await send(token);
  } catch {
    throw new ApiError("Could not reach the server. Is the backend running?", { status: 0 });
  }

  // a 401 despite a fresh-looking token: try exactly one refresh + replay
  if (res.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await send(newToken);
    }
    if (res.status === 401) {
      redirectToLogin();
      throw new ApiError("Your session has expired. Please sign in again.", { status: 401 });
    }
  }

  if (raw) return res;

  if (res.status === 204) return null;

  let data = null;
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  if (isJson) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    throw new ApiError(
      messageFromErrorBody(data, `Request failed (${res.status}).`),
      { status: res.status, data }
    );
  }

  return data;
}

export const apiGet = (endpoint, options) => apiFetch(endpoint, { ...options, method: "GET" });

export const apiPost = (endpoint, body, options) =>
  apiFetch(endpoint, { ...options, method: "POST", body });

export const apiPatch = (endpoint, body, options) =>
  apiFetch(endpoint, { ...options, method: "PATCH", body });

export const apiDelete = (endpoint, options) =>
  apiFetch(endpoint, { ...options, method: "DELETE" });

/** Build "?a=1&b=2" from an object, dropping empty values. */
export function queryString(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
