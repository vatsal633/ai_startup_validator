"use client";

import { createContext, useContext } from "react";
import { useCurrentUser } from "./useCurrentUser";

const UserContext = createContext(null);

/**
 * Fetches the signed-in user once and shares it with the whole dashboard.
 * Must be rendered inside the auth guard — it assumes there is a token.
 */
export function UserProvider({ children }) {
  const value = useCurrentUser();
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/** The shared profile. Falls back to its own fetch outside a provider. */
export function useUser() {
  const context = useContext(UserContext);
  if (context) return context;
  throw new Error("useUser must be used inside a UserProvider");
}
