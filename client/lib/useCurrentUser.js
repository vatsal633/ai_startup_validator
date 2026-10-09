"use client";

import { useCallback, useEffect, useState } from "react";
import { getMe } from "./endpoints";
import { getRole, getTokenPayload } from "./auth";

/**
 * The signed-in user's profile.
 *
 * Returns the role straight from the JWT first so nav and guards can render
 * immediately, then fills in the full profile from /api/auth/me/.
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUser(await getMe());
    } catch (err) {
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // no token at all — nothing to fetch, let the guard handle the redirect
    if (!getTokenPayload()) {
      setLoading(false);
      return;
    }
    reload();
  }, [reload]);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.email ||
    "";

  return {
    user,
    loading,
    error,
    reload,
    setUser,
    displayName,
    initial: (displayName || "?").charAt(0).toUpperCase(),
    // available before the profile request finishes
    role: user?.role ?? getRole(),
  };
}
