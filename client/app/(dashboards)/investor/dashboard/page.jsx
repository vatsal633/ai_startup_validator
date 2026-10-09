"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import StatCard from "../../components/StateCard";
import QuickAction from "../../components/QuickAction";
import Activity from "../../components/Activity";
import {
  listConnections,
  listIdeas,
  listNotifications,
  requestConnection,
} from "@/lib/endpoints";
import { formatFunding, stageLabel } from "@/lib/ideaOptions";
import { useUser } from "@/lib/userContext";
import { relativeTime } from "@/lib/relativeTime";

const NOTIFICATION_ICON = {
  connection_requested: "💰",
  connection_accepted: "🤝",
  connection_declined: "✕",
};

const REQUEST_LABEL = {
  pending: "Requested",
  accepted: "Access granted",
  declined: "Declined",
};

function RecommendedCard({ idea, requestStatus, onRequest }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleRequest = async () => {
    setBusy(true);
    setError("");
    try {
      await onRequest(idea.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          {(idea.title || "?").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{idea.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {idea.idea}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {idea.industry}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {stageLabel(idea.stage)}
            </span>
            <span className="text-xs text-slate-400">
              {formatFunding(idea.funding_requirement)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-5 dark:sm:border-slate-800">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              AI Score
            </p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {idea.ai_validation_score ?? "—"}
            </p>
          </div>
        </div>

        {requestStatus ? (
          <span className="shrink-0 rounded-lg bg-slate-100 px-4 py-2 text-center text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {REQUEST_LABEL[requestStatus] ?? requestStatus}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleRequest}
            disabled={busy}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            {busy && <LoaderCircle size={13} className="animate-spin" />}
            Request access
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

const InvestorDashboard = () => {
  const { displayName } = useUser();
  const [ideas, setIdeas] = useState([]);
  const [marketCount, setMarketCount] = useState(0);
  const [connections, setConnections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [ideasResult, connectionsResult, notificationsResult] = await Promise.allSettled([
      listIdeas({ ordering: "score" }),
      listConnections(),
      listNotifications(),
    ]);

    if (ideasResult.status === "fulfilled") {
      setIdeas((ideasResult.value?.results ?? []).slice(0, 4));
      setMarketCount(ideasResult.value?.count ?? 0);
    }
    if (connectionsResult.status === "fulfilled") {
      setConnections(connectionsResult.value?.results ?? []);
    }
    if (notificationsResult.status === "fulfilled") {
      setNotifications((notificationsResult.value?.results ?? []).slice(0, 4));
    }

    const failure = [ideasResult, connectionsResult, notificationsResult].find(
      (result) => result.status === "rejected"
    );
    setError(failure ? failure.reason?.message ?? "Some data could not be loaded." : "");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // idea id -> this investor's request status, so cards know what to show
  const requestByIdea = useMemo(() => {
    const map = new Map();
    for (const connection of connections) {
      map.set(connection.idea, connection.status);
    }
    return map;
  }, [connections]);

  const handleRequest = async (ideaId) => {
    await requestConnection(ideaId);
    const data = await listConnections();
    setConnections(data?.results ?? []);
  };

  const accepted = connections.filter((c) => c.status === "accepted").length;
  const pending = connections.filter((c) => c.status === "pending").length;
  const firstName = displayName.split(" ")[0] || "Investor";

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
              Here&apos;s what&apos;s happening across your startup pipeline.
            </p>
          </div>

          <Link
            href="/startups"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Discover Startups
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
          <StatCard icon="🔎" label="Startups Listed" value={marketCount} change="" />
          <StatCard icon="🤝" label="Requests Sent" value={connections.length} change="" />
          <StatCard icon="✅" label="Access Granted" value={accepted} change="" />
          <StatCard icon="⏳" label="Awaiting Reply" value={pending} change="" />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Top Scoring Startups</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  The highest AI validation scores on the marketplace right now.
                </p>
              </div>
              <Link
                href="/startups"
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
                  <RecommendedCard
                    key={idea.id}
                    idea={idea}
                    requestStatus={requestByIdea.get(idea.id)}
                    onRequest={handleRequest}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="font-semibold">No startups published yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Check back once founders start publishing their ideas.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-bold">Quick Actions</h2>
              <div className="mt-4 space-y-2">
                <QuickAction
                  href="/startups"
                  icon="🔎"
                  title="Discover Startups"
                  description="Browse the marketplace"
                />
                <QuickAction
                  href="/investor/requests"
                  icon="📁"
                  title="My Requests"
                  description={
                    pending ? `${pending} awaiting a reply` : "Nothing outstanding"
                  }
                />
                <QuickAction
                  href="/investor/notifications"
                  icon="📬"
                  title="Notifications"
                  description="Founder responses"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Recent Activity</h2>
                <Link
                  href="/investor/notifications"
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
                    Nothing yet. Request access to a startup to get started.
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

export default InvestorDashboard;
