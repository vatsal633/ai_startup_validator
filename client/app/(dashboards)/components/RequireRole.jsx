"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, homePathForRole, isAuthenticated } from "@/lib/auth";

/**
 * Keeps a dashboard section to the role it belongs to.
 *
 * This is a UX guard, not a security boundary: the tokens live in
 * localStorage, so it can only run in the browser, and anyone can edit what
 * the browser holds. The API enforces the real rules on every request.
 */
export default function RequireRole({ role: requiredRole, children }) {
  const router = useRouter();
  // "checking" until the first client render — the server has no localStorage,
  // so rendering children before this point would flash protected markup
  const [state, setState] = useState("checking");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const role = getRole();
    if (requiredRole && role !== requiredRole) {
      // signed in, wrong section — send them to their own dashboard
      router.replace(homePathForRole(role));
      return;
    }

    setState("allowed");
  }, [requiredRole, router]);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Checking your session…</p>
        </div>
      </div>
    );
  }

  return children;
}
