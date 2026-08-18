import React from "react";
import Link from "next/link";
import ThemeToggle from "@/app/components/ui/themeToggle";
import NavItem from "../../components/NavItem";
import StatCard from "../../components/StateCard";
import StartupCard from "../../components/StartupCard";
import QuickAction from "../../components/QuickAction";
import Activity from "../../components/Activity";
import { startups, activities } from "@/app/dummydata/dashboardData";
import TopNavbar from "../../components/TopNavbar";

const founderDashboard = () => {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="flex">
        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {/* PAGE HEADER */}
            <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-indigo-600">Overview</p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Good morning, Founder 👋
                </h1>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Here&apos;s what&apos;s happening with your startup ideas.
                </p>
              </div>

              <Link
                href="/analyze"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                + Analyze New Idea
              </Link>
            </section>

            {/* STATISTICS */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon="💡"
                label="Total Ideas"
                value="6"
                change="+2 this month"
              />

              <StatCard
                icon="🚀"
                label="Published"
                value="3"
                change="+1 this month"
              />

              <StatCard
                icon="👁"
                label="Total Views"
                value="426"
                change="+18.4%"
              />

              <StatCard
                icon="💰"
                label="Investor Requests"
                value="8"
                change="+3 this week"
              />
            </section>

            {/* MAIN GRID */}
            <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
              {/* STARTUPS */}
              <div className="min-w-0">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">My Startups</h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Manage and monitor your startup ideas.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/startups"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View all →
                  </Link>
                </div>

                <div className="space-y-4">
                  {startups.map((startup) => (
                    <StartupCard key={startup.name} startup={startup} />
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* QUICK ACTIONS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="font-bold">Quick Actions</h2>

                  <div className="mt-4 space-y-2">
                    <QuickAction
                      href="/analyze"
                      icon="✦"
                      title="Analyze New Idea"
                      description="Get AI validation"
                    />

                    <QuickAction
                      href="/dashboard/startups"
                      icon="💡"
                      title="Manage Ideas"
                      description="View your startups"
                    />

                    <QuickAction
                      href="/dashboard/requests"
                      icon="💰"
                      title="Investor Requests"
                      description="Review 4 requests"
                    />
                  </div>
                </div>

                {/* AI INSIGHT */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                      ✦
                    </span>

                    <h2 className="font-bold text-indigo-950 dark:text-indigo-300">
                      AI Insight
                    </h2>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-indigo-900 dark:text-indigo-200">
                    Your strongest startup is <strong>FarmSense AI</strong> with
                    an AI validation score of 87/100.
                  </p>

                  <Link
                    href="/startup/1"
                    className="mt-4 block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View full analysis →
                  </Link>
                </div>

                {/* RECENT ACTIVITY */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold">Recent Activity</h2>

                    <Link
                      href="/dashboard/notifications"
                      className="text-xs font-semibold text-indigo-600"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="mt-5 space-y-5">
                    {activities.map((activity, index) => (
                      <Activity key={index} activity={activity} />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </main>
  );
};

export default founderDashboard;
