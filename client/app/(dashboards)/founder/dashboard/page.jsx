"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import StatCard from "../../components/StateCard";
import MyIdeaCard from "../../components/MyIdeaCard";
import QuickAction from "../../components/QuickAction";
import Activity from "../../components/Activity";
import { getDashboardStats, listMyIdeas, listNotifications } from "@/lib/endpoints";
import { useUser } from "@/lib/userContext";
import { relativeTime } from "@/lib/relativeTime";

const NOTIFICATION_ICON = {
  connection_requested: "💰",
  connection_accepted: "🤝",
  connection_declined: "✕",
};

/** "+2 this month" / "+18.4%" — blank when there's nothing to say. */
function changeLabel(value, suffix) {
  if (!value) return "";
  return suffix === "%"
    ? `${value > 0 ? "+" : ""}${value}%`
    : `+${value} ${suffix}`;
}

const FounderDashboard = () => {
  const { displayName } = useUser();
  const [stats, setStats] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // one failure shouldn't blank the whole dashboard, so settle them all
        const [statsResult, ideasResult, notificationsResult] = await Promise.allSettled([
          getDashboardStats(),
          listMyIdeas(),
          listNotifications(),
        ]);
        if (cancelled) return;

        if (statsResult.status === "fulfilled") setStats(statsResult.value);
        if (ideasResult.status === "fulfilled") {
          setIdeas((ideasResult.value?.results ?? []).slice(0, 3));
        }
        if (notificationsResult.status === "fulfilled") {
          setNotifications((notificationsResult.value?.results ?? []).slice(0, 4));
        }

        const failure = [statsResult, ideasResult, notificationsResult].find(
          (result) => result.status === "rejected"
        );
        if (failure) setError(failure.reason?.message ?? "Some data could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const topIdea = ideas
    .filter((idea) => typeof idea.ai_validation_score === "number")
    .sort((a, b) => b.ai_validation_score - a.ai_validation_score)[0];

  const firstName = displayName.split(" ")[0] || "Founder";

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">Overview</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Here&apos;s what&apos;s happening with your startup ideas.
            </p>
          </div>

          <Link
            href="/founder/analyze"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            + Analyze New Idea
          </Link>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="💡"
            label="Total Ideas"
            value={stats?.total_ideas ?? "—"}
            change={changeLabel(stats?.ideas_this_month, "this month")}
          />
          <StatCard
            icon="🚀"
            label="Published"
            value={stats?.published ?? "—"}
            change={changeLabel(stats?.published_this_month, "this month")}
          />
          <StatCard
            icon="👁"
            label="Total Views"
            value={stats?.total_views ?? "—"}
            change={changeLabel(stats?.views_change_percent, "%")}
          />
          <StatCard
            icon="💰"
            label="Investor Requests"
            value={stats?.investor_requests ?? "—"}
            change={changeLabel(stats?.requests_this_week, "this week")}
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">My Startups</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage and monitor your startup ideas.
                </p>
              </div>
              <Link
                href="/founder/myideas"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 dark:border-slate-700 dark:bg-slate-900">
                <LoaderCircle size={22} className="animate-spin text-indigo-600" />
              </div>
            ) : ideas.length > 0 ? (
              <div className="space-y-4">
                {ideas.map((idea) => (
                  <MyIdeaCard
                    key={idea.id}
                    idea={idea}
                    onChanged={(updated) =>
                      setIdeas((current) =>
                        updated === null
                          ? current.filter((item) => item.id !== idea.id)
                          : current.map((item) =>
                              item.id === idea.id ? { ...item, ...updated } : item
                            )
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="font-semibold">No ideas yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Run your first AI validation to get started.
                </p>
                <Link
                  href="/founder/analyze"
                  className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Analyze an idea
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-bold">Quick Actions</h2>
              <div className="mt-4 space-y-2">
                <QuickAction
                  href="/founder/analyze"
                  icon="✦"
                  title="Analyze New Idea"
                  description="Get AI validation"
                />
                <QuickAction
                  href="/founder/myideas"
                  icon="💡"
                  title="Manage Ideas"
                  description="View your startups"
                />
                <QuickAction
                  href="/founder/requests"
                  icon="💰"
                  title="Investor Requests"
                  description={
                    stats?.pending_requests
                      ? `Review ${stats.pending_requests} pending`
                      : "No pending requests"
                  }
                />
              </div>
            </div>

            {topIdea && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                    ✦
                  </span>
                  <h2 className="font-bold text-indigo-950 dark:text-indigo-300">AI Insight</h2>
                </div>
                <p className="mt-4 text-sm leading-6 text-indigo-900 dark:text-indigo-200">
                  Your strongest startup is <strong>{topIdea.title}</strong> with an AI
                  validation score of {topIdea.ai_validation_score}/100.
                </p>
                <Link
                  href="/founder/myideas"
                  className="mt-4 block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View full analysis →
                </Link>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Recent Activity</h2>
                <Link
                  href="/founder/notifications"
                  className="text-xs font-semibold text-indigo-600"
                >
                  View all
                </Link>
              </div>

              <div className="mt-5 space-y-5">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <Activity
                      key={notification.id}
                      activity={{
                        icon: NOTIFICATION_ICON[notification.notification_type] ?? "🔔",
                        title: notification.idea_title || "Notification",
                        description: notification.message,
                        time: relativeTime(notification.created_at),
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nothing yet. Investor interest will show up here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default FounderDashboard;
