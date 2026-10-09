"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Search } from "lucide-react";
import MyIdeaCard from "../../components/MyIdeaCard";
import { listMyIdeas } from "@/lib/endpoints";
import { STATUSES } from "@/lib/ideaOptions";

const MyIdeas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (filters) => {
    setLoading(true);
    setError("");
    try {
      const data = await listMyIdeas(filters);
      setIdeas(data?.results ?? []);
    } catch (err) {
      setError(err.message);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // debounce the search box so typing doesn't fire a request per keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      load({ q: searchTerm, status: statusFilter });
    }, 300);
    return () => clearTimeout(timer);
  }, [load, searchTerm, statusFilter]);

  /** Swap in the updated idea, or drop it when it was deleted. */
  const handleChanged = (id) => (updated) => {
    setIdeas((current) =>
      updated === null
        ? current.filter((idea) => idea.id !== id)
        : current.map((idea) =>
            // the publish endpoint returns the detail shape, which lacks the
            // list-only annotations, so merge rather than replace
            idea.id === id ? { ...idea, ...updated } : idea
          )
    );
  };

  const publishedCount = ideas.filter((idea) => idea.status === "published").length;
  const scored = ideas.filter((idea) => typeof idea.ai_validation_score === "number");
  const averageScore = scored.length
    ? Math.round(scored.reduce((total, idea) => total + idea.ai_validation_score, 0) / scored.length)
    : null;

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Founder workspace</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">My ideas</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Keep your startup concepts organized, validated, and ready for the right investors.
            </p>
          </div>

          <Link
            href="/founder/analyze"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <span className="mr-2 text-base">+</span> Analyze new idea
          </Link>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total ideas</p>
            <p className="mt-2 text-3xl font-bold">{ideas.length}</p>
            <p className="mt-2 text-xs font-medium text-slate-400">Across your workspace</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Published</p>
            <p className="mt-2 text-3xl font-bold">{publishedCount}</p>
            <p className="mt-2 text-xs font-medium text-emerald-600">Visible to investors</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Average AI score</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {averageScore ?? "—"}
              {averageScore !== null && (
                <span className="text-base font-medium text-slate-400">/100</span>
              )}
            </p>
            <p className="mt-2 text-xs font-medium text-slate-400">Based on analyzed ideas</p>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-bold">Your startup portfolio</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {loading
                  ? "Loading…"
                  : `${ideas.length} ${ideas.length === 1 ? "idea" : "ideas"} shown`}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <span className="sr-only">Search ideas</span>
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search ideas"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-52 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-indigo-950"
                />
              </label>

              <label>
                <span className="sr-only">Filter by status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-36 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-indigo-950"
                >
                  <option value="">All statuses</option>
                  {STATUSES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
          ) : ideas.length > 0 ? (
            <div className="space-y-4">
              {ideas.map((idea) => (
                <MyIdeaCard key={idea.id} idea={idea} onChanged={handleChanged(idea.id)} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="font-semibold">
                {searchTerm || statusFilter ? "No ideas found" : "No ideas yet"}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {searchTerm || statusFilter
                  ? "Try a different search or status filter."
                  : "Analyze your first idea to see it here."}
              </p>
              {!searchTerm && !statusFilter && (
                <Link
                  href="/founder/analyze"
                  className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Analyze an idea
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MyIdeas;
