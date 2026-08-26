"use client";

import Link from "next/link";
import { Bell, Check, CheckCheck, ChevronRight, Filter, Lightbulb, MessageCircle, Rocket, Sparkles, Users } from "lucide-react";
import { useState } from "react";

const initialNotifications = [
  {
    id: 1,
    type: "investor",
    icon: Users,
    iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    title: "New investor request",
    description: "Maya Chen wants to connect about FarmSense AI.",
    time: "12 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "analysis",
    icon: Sparkles,
    iconClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    title: "Your analysis is ready",
    description: "CareCircle has received its market validation score.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 3,
    type: "idea",
    icon: Lightbulb,
    iconClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    title: "Idea saved successfully",
    description: "Your notes for LocalLoop were saved to My Ideas.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 4,
    type: "message",
    icon: MessageCircle,
    iconClass: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    title: "You have a new message",
    description: "Alex Rivera replied to your conversation about the pitch deck.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 5,
    type: "milestone",
    icon: Rocket,
    iconClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    title: "You reached a milestone",
    description: "Your startup profile has been viewed 100 times.",
    time: "Aug 20, 2026",
    unread: false,
  },
];

const filters = ["All activity", "Unread", "Investor requests", "Analyses"];

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState("All activity");
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const visibleNotifications = notifications.filter((notification) => {
    if (activeFilter === "Unread") return notification.unread;
    if (activeFilter === "Investor requests") return notification.type === "investor";
    if (activeFilter === "Analyses") return notification.type === "analysis";
    return true;
  });

  function markAllAsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
  }

  function markAsRead(id) {
    setNotifications((current) => current.map((notification) => (
      notification.id === id ? { ...notification, unread: false } : notification
    )));
  }

  return (
    <main className="min-h-screen min-w-0 flex-1 bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-indigo-600">Your workspace</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Stay close to the people and progress shaping your startup ideas.
            </p>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={!unreadCount}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-indigo-600" />
                <h2 className="font-bold">Activity</h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400"><Filter size={13} /> {visibleNotifications.length} updates</span>
            </div>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${activeFilter === filter ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-500 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {visibleNotifications.length ? visibleNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <article key={notification.id} className={`group relative flex gap-4 border-b border-slate-100 p-4 transition last:border-0 sm:p-5 dark:border-slate-800 ${notification.unread ? "bg-indigo-50/45 dark:bg-indigo-950/15" : ""}`}>
                    {notification.unread && <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600" />}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.iconClass}`}><Icon size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
                        <h3 className="text-sm font-bold">{notification.title}</h3>
                        <time className="shrink-0 text-xs text-slate-400">{notification.time}</time>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{notification.description}</p>
                      <div className="mt-3 flex items-center gap-4">
                        {notification.type === "investor" && <Link href="/founder/requests" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Review request <ChevronRight size={13} className="inline" /></Link>}
                        {notification.type === "analysis" && <Link href="/founder/analyze" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View analysis <ChevronRight size={13} className="inline" /></Link>}
                        {notification.unread && <button type="button" onClick={() => markAsRead(notification.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><Check size={13} /> Mark read</button>}
                      </div>
                    </div>
                  </article>
                );
              }) : <div className="p-10 text-center"><p className="font-semibold">You&apos;re all caught up</p><p className="mt-1 text-sm text-slate-500">No notifications match this filter.</p></div>}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div className="flex items-center justify-between"><p className="text-sm font-bold text-indigo-950 dark:text-indigo-200">Weekly digest</p><span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">Aug 24</span></div>
              <p className="mt-4 text-3xl font-bold text-indigo-950 dark:text-white">12 <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">meaningful updates</span></p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-900"><div className="h-full w-3/4 rounded-full bg-indigo-600" /></div>
              <p className="mt-3 text-xs leading-5 text-indigo-700 dark:text-indigo-300">Your ideas are getting more attention this week. Keep the momentum going.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-bold">Stay in the loop</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Get notified when investors respond or an analysis is complete.</p>
              <Link href="/founder/settings" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700">Notification settings <ChevronRight size={15} /></Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}