"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCheck, LoaderCircle, Users } from "lucide-react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/endpoints";
import { relativeTime } from "@/lib/relativeTime";

const TYPES = [
  { value: "", label: "All" },
  { value: "connection_requested", label: "Requests" },
  { value: "connection_accepted", label: "Accepted" },
  { value: "connection_declined", label: "Declined" },
];

const STYLES = {
  connection_requested: {
    icon: "💰",
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
  connection_accepted: {
    icon: "🤝",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  connection_declined: {
    icon: "✕",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },
};

/**
 * The notifications screen, shared by both roles. Only the empty-state copy
 * differs, so the two routes render this rather than keeping two copies.
 */
export default function NotificationsView({ role = "founder" }) {
  const [notifications, setNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listNotifications({
        type: typeFilter,
        ...(unreadOnly ? { unread: "true" } : {}),
      });
      setNotifications(data?.results ?? []);
    } catch (err) {
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, unreadOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const markOne = async (id) => {
    // optimistic — a failed mark is not worth blocking the UI for
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );
    try {
      await markNotificationRead(id);
    } catch {
      load();
    }
  };

  const markAll = async () => {
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Inbox</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up."}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-white sm:self-auto dark:border-slate-700 dark:hover:bg-slate-900"
            >
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </section>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                typeFilter === value
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              {label}
            </button>
          ))}

          <label className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
            Unread only
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 dark:border-slate-700 dark:bg-slate-900">
            <LoaderCircle size={22} className="animate-spin text-indigo-600" />
          </div>
        ) : notifications.length > 0 ? (
          <ul className="space-y-3">
            {notifications.map((notification) => {
              const style = STYLES[notification.notification_type] ?? {
                icon: "🔔",
                className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
              };

              return (
                <li
                  key={notification.id}
                  className={`flex gap-4 rounded-2xl border p-4 transition ${
                    notification.is_read
                      ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                      : "border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/60 dark:bg-indigo-950/20"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.className}`}
                  >
                    {style.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {notification.idea_title || "Notification"}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {relativeTime(notification.created_at)}
                    </p>
                  </div>

                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => markOne(notification.id)}
                      className="shrink-0 self-start text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            <Users size={26} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold">Nothing here</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {role === "investor"
                ? "Founder responses to your access requests will show up here."
                : "Investor interest in your ideas will show up here."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
