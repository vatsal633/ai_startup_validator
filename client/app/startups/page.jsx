"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Search } from "lucide-react";
import ThemeToggle from "../components/ui/themeToggle";
import { listIdeas } from "@/lib/endpoints";
import { INDUSTRIES, STAGES, formatFunding, stageLabel } from "@/lib/ideaOptions";
import { relativeTime } from "@/lib/relativeTime";

const ORDERINGS = [
  { value: "newest", label: "Newest first" },
  { value: "score", label: "Highest AI score" },
  { value: "funding", label: "Largest raise" },
  { value: "oldest", label: "Oldest first" },
];

function StartupCard({ idea }) {
  return (
    <Link
      href={`/founder/myideas`}
      onClick={(event) => event.preventDefault()}
      className="block cursor-default rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          {(idea.title || "?").charAt(0).toUpperCase()}
        </div>

        {typeof idea.ai_validation_score === "number" && (
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              AI Score
            </p>
            <p className="text-xl font-bold text-indigo-600">{idea.ai_validation_score}</p>
          </div>
        )}
      </div>

      <h3 className="mt-4 font-bold">{idea.title}</h3>
      <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {idea.idea}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {idea.industry}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {stageLabel(idea.stage)}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {idea.country}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-800">
        <span>{idea.founder_name || "Independent founder"}</span>
        <span>{formatFunding(idea.funding_requirement)}</span>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Listed {relativeTime(idea.created_at)}
      </p>
    </Link>
  );
}

export default function StartupsPage() {
  const [filters, setFilters] = useState({
    q: "",
    industry: "",
    stage: "",
    min_score: "",
    ordering: "newest",
  });
  const [ideas, setIdeas] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const update = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  const load = useCallback(async (active) => {
    setLoading(true);
    setError("");
    try {
      const data = await listIdeas(active);
      setIdeas(data?.results ?? []);
      setCount(data?.count ?? 0);
    } catch (err) {
      setError(err.message);
      setIdeas([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // debounced so typing in the search box doesn't hammer the API
  useEffect(() => {
    const timer = setTimeout(() => load(filters), 300);
    return () => clearTimeout(timer);
  }, [load, filters]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Venture<span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300"
            >
              Sign in
            </Link>
            <ThemeToggle />
          </div>
        </nav>

        <section className="mt-10">
          <p className="text-sm font-semibold text-indigo-600">Marketplace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Discover validated startups
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Every listing here has been through an AI validation report. Sign in as an
            investor to request the full details from a founder.
          </p>
        </section>

        <section className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative lg:col-span-2">
            <span className="sr-only">Search startups</span>
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={filters.q}
              onChange={(event) => update("q", event.target.value)}
              placeholder="Search by name, industry or problem"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <label>
            <span className="sr-only">Industry</span>
            <select
              value={filters.industry}
              onChange={(event) => update("industry", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All industries</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Stage</span>
            <select
              value={filters.stage}
              onChange={(event) => update("stage", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Any stage</option>
              {STAGES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Sort by</span>
            <select
              value={filters.ordering}
              onChange={(event) => update("ordering", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            >
              {ORDERINGS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          {loading ? "Loading…" : `${count} ${count === 1 ? "startup" : "startups"} listed`}
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 dark:border-slate-700 dark:bg-slate-900">
            <LoaderCircle size={24} className="animate-spin text-indigo-600" />
          </div>
        ) : ideas.length > 0 ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <StartupCard key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="font-semibold">No startups match those filters</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try widening your search.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
