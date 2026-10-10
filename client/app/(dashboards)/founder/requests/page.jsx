"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  LoaderCircle,
  Mail,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { listConnections, respondToConnection } from "@/lib/endpoints";
import { relativeTime } from "@/lib/relativeTime";
import { formatDate } from "@/lib/ideaOptions";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "", label: "All" },
];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  declined: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

function RequestCard({ request, onResponded }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const respond = async (action) => {
    setBusy(action);
    setError("");
    try {
      onResponded(await respondToConnection(request.id, action));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const investor = request.investor_profile ?? {};
  const isPending = request.status === "pending";

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          {(investor.name || "?").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{investor.name || "An investor"}</h3>
            {investor.is_verified && (
              <BadgeCheck size={15} className="text-indigo-500" aria-label="Verified" />
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                STATUS_STYLES[request.status]
              }`}
            >
              {request.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            wants access to{" "}
            <Link
              href={`/founder/myideas/${request.idea}`}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {request.idea_title}
            </Link>
          </p>

          {investor.bio && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {investor.bio}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            {investor.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {investor.location}
              </span>
            )}
            {investor.linkedin && (
              <a
                href={investor.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:underline"
              >
                LinkedIn
              </a>
            )}
            {investor.website && (
              <a
                href={investor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:underline"
              >
                Website
              </a>
            )}
            {investor.member_since && (
              <span>Member since {formatDate(investor.member_since)}</span>
            )}
            <span>Requested {relativeTime(request.requested_at)}</span>
          </div>

          {/* the email is what accepting unlocks, so it only appears after */}
          {investor.email ? (
            <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Mail size={14} />
              <a href={`mailto:${investor.email}`} className="font-medium hover:underline">
                {investor.email}
              </a>
            </p>
          ) : (
            isPending && (
              <p className="mt-3 text-xs text-slate-400">
                Accepting shares your full idea detail and reveals their email so you
                can get in touch.
              </p>
            )
          )}

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {error}
            </p>
          )}
        </div>

        {isPending && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => respond("accept")}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
            >
              {busy === "accept" ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Accept
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => respond("decline")}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {busy === "decline" ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <X size={14} />
              )}
              Decline
            </button>
          </div>
        )}

        {request.status === "accepted" && request.accepted_at && (
          <span className="shrink-0 text-xs text-slate-400">
            Accepted {relativeTime(request.accepted_at)}
          </span>
        )}
      </div>
    </li>
  );
}

export default function InvestorRequestsPage() {
  const [tab, setTab] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      // the full list drives the counters, the filtered one drives the body
      const [filtered, everything] = await Promise.all([
        listConnections(status ? { status } : {}),
        listConnections(),
      ]);
      setRequests(filtered?.results ?? []);
      setAllRequests(everything?.results ?? []);
    } catch (err) {
      setError(err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [load, tab]);

  const counts = useMemo(
    () =>
      allRequests.reduce(
        (acc, request) => ({ ...acc, [request.status]: (acc[request.status] ?? 0) + 1 }),
        {}
      ),
    [allRequests]
  );

  /** Replace the responded request, and drop it if it no longer fits the tab. */
  const handleResponded = (updated) => {
    setAllRequests((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
    setRequests((current) =>
      tab && updated.status !== tab
        ? current.filter((item) => item.id !== updated.id)
        : current.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const pending = counts.pending ?? 0;

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <section className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">Founder workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Investor requests</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Investors who want the full detail behind your published ideas. Accepting
            shares your complete analysis with that investor only.
          </p>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["Pending", pending, "text-amber-600"],
            ["Accepted", counts.accepted ?? 0, "text-emerald-600"],
            ["Declined", counts.declined ?? 0, "text-slate-400"],
          ].map(([label, value, tone]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
            </div>
          ))}
        </section>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {TABS.map(({ value, label }) => (
            <button
              key={value || "all"}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === value
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              {label}
              {value === "pending" && pending > 0 && (
                <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                  {pending}
                </span>
              )}
            </button>
          ))}
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
        ) : requests.length > 0 ? (
          <ul className="space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onResponded={handleResponded}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            <Users size={26} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold">
              {tab === "pending" ? "No pending requests" : "Nothing here"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {allRequests.length === 0
                ? "Publish an idea and investors will be able to request access to it."
                : "Try another tab."}
            </p>
            {allRequests.length === 0 && (
              <Link
                href="/founder/myideas"
                className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Go to My Ideas
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
