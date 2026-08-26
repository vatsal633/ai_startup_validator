"use client"
import React,{useState} from "react";
import Link from "next/link";
import { startups } from "../../../dummydata/dashboardData.js";
import StartupCard from "../../components/StartupCard.jsx";

const MyIdeas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredStartups = startups.filter((startup) => {
    const matchesSearch = `${startup.name} ${startup.description} ${startup.category}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || startup.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const publishedCount = startups.filter((startup) => startup.status === "Published").length;
  const averageScore = Math.round(
    startups.reduce((totalScore, startup) => totalScore + startup.score, 0) / startups.length,
  );

  return (
    <main
      className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors w-full dark:bg-slate-950 dark:text-white">
      <main className="min-w-0 flex-1">
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
              <p className="mt-2 text-3xl font-bold">{startups.length}</p>
              <p className="mt-2 text-xs font-medium text-slate-400">Across your workspace</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Published</p>
              <p className="mt-2 text-3xl font-bold">{publishedCount}</p>
              <p className="mt-2 text-xs font-medium text-emerald-600">Visible to investors</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Average AI score</p>
              <p className="mt-2 text-3xl font-bold text-indigo-600">{averageScore}<span className="text-base font-medium text-slate-400">/100</span></p>
              <p className="mt-2 text-xs font-medium text-slate-400">Based on analyzed ideas</p>
            </div>
          </section>

          <section>
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-lg font-bold">Your startup portfolio</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {filteredStartups.length} {filteredStartups.length === 1 ? "idea" : "ideas"} shown
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative">
                  <span className="sr-only">Search ideas</span>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
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
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-32 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-indigo-950"
                  >
                    <option>All</option>
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {filteredStartups.map((startup) => (
                <StartupCard key={startup.name} startup={startup} />
              ))}
            </div>

            {filteredStartups.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="font-semibold">No ideas found</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different search or status filter.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </main>
  );
};

export default MyIdeas;
