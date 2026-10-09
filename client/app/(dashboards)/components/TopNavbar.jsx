"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/app/components/ui/themeToggle";
import { logout } from "@/lib/endpoints";

const ROLE_LABEL = {
  founder: "Founder",
  investor: "Investor",
  admin: "Admin",
};

const TopNavbar = ({ header, role = "founder", displayName, initial = "?", unreadCount = 0 }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close the profile menu on an outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const roleLabel = ROLE_LABEL[role] ?? "Account";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            V
          </div>
          <span className="font-bold">
            Venture<span className="text-indigo-600">AI</span>
          </span>
        </div>

        <div className="hidden lg:block">
          <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
            {roleLabel}
            {header ? ` · ${header}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href={`/${role}/notifications`}
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                {initial}
              </div>
              <div className="hidden text-left sm:block">
                <p className="max-w-[12rem] truncate text-sm font-semibold">
                  {displayName || "Loading…"}
                </p>
                <p className="text-xs text-slate-400">{roleLabel} Account</p>
              </div>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <Link
                  href={`/${role}/settings`}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
