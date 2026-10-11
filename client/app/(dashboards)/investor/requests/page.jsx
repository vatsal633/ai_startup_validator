"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Clock,
  LoaderCircle,
  Mail,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { listConnections } from "@/lib/endpoints";
import { relativeTime } from "@/lib/relativeTime";
import { formatFunding } from "@/lib/ideaOptions";

const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Awaiting reply" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

const STATUS = {
  pending: {
    label: "Awaiting reply",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  declined: {
    label: "Declined",
    className: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
};

function RequestCard({ request }) {
  const founder = request.founder_profile ?? {};
  const idea = request.idea_summary ?? {};
  const status = STATUS[request.status] ?? STATUS.pending;

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          {(request.idea_title || "?").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{request.idea_title}</h3>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            by {founder.name || "the founder"}
            {founder.is_verified && (
              <BadgeCheck
                size={14}
                className="ml-1 inline text-indigo-500"
                aria-label="Verified"
              />
            )}
            {founder.location ? ` · ${founder.location}` : ""}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {idea.industry && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {idea.industry}
              </span>
            )}
            {idea.stage_display && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {idea.stage_display}
              </span>
            )}
            {idea.funding_requirement && (
              <span className="text-xs text-slate-400">
                {formatFunding(idea.funding_requirement)}
              </span>
            )}
            {typeof idea.ai_validation_score === "number" && (
              <span className="text-xs font-semibold text-indigo-600">
                AI score {Math.round(idea.ai_validation_score)}
              </span>
            )}
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={12} /> Requested {relativeTime(request.requested_at)}
            {request.accepted_at && ` · accepted ${relativeTime(request.accepted_at)}`}
          </p>

          {request.status === "accepted" && founder.email && (
            <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm dark:bg-emerald-950/40">
              <p className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <Mail size={14} />
                <a
                  href={`mailto:${founder.email}?subject=${encodeURIComponent(
                    `About ${request.idea_title}`
                  )}`}
                  className="font-medium hover:underline"
                >
                  {founder.email}
                </a>
              </p>
              <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80">
                Your request was accepted — reach out directly.
              </p>
            </div>
          )}

          {request.status === "pending" && (
            <p className="mt-3 text-xs text-slate-400">
              Waiting on the founder. You&apos;ll be notified when they respond.
            </p>
          )}

          {request.status === "declined" && (
            <p className="mt-3 text-xs text-slate-400">
              The founder declined this request. Their public summary is still on the
              marketplace.
            </p>
          )}

          {founder.bio && request.status === "accepted" && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {founder.bio}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {founder.linkedin && (
            <a
              href={founder.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export default function InvestorRequestsPage() {
  const [tab, setTab] = useState("");
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

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Investor workspace</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">My requests</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Startups whose full detail you&apos;ve asked to see. Founders decide who
              gets access, so some requests stay pending.
            </p>
          </div>

          <Link
            href="/startups"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Search size={15} /> Discover more
          </Link>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["Awaiting reply", counts.pending ?? 0, "text-amber-600"],
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
              <RequestCard key={request.id} request={request} />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            <Users size={26} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold">
              {allRequests.length === 0 ? "No requests yet" : "Nothing in this tab"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {allRequests.length === 0
                ? "Find a startup on the marketplace and request access to its full analysis."
                : "Try another tab."}
            </p>
            {allRequests.length === 0 && (
              <Link
                href="/startups"
                className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Discover startups
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
