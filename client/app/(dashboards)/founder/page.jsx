import React from "react";
import Link from "next/link";
import ThemeToggle from "@/app/components/ui/themeToggle";
import NavItem from "../components/NavItem";
import StatCard from "../components/StateCard";
import StartupCard from "../components/StartupCard";
import QuickAction from "../components/QuickAction";
import Activity from "../components/Activity";
import { startups,activities } from "@/app/dummydata/dashboardData";


const founderDashboard = () => {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              V
            </div>

            <span className="font-bold">
              Venture<span className="text-indigo-600">AI</span>
            </span>
          </div>

          <div className="hidden lg:block">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Founder Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
              🔔
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                V
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold">Founder</p>
                <p className="text-xs text-slate-400">Founder Account</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-4">
            {/* Logo */}
            <Link href="/" className="mb-8 flex items-center gap-3 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                V
              </div>

              <span className="text-lg font-bold">
                Venture<span className="text-indigo-600">AI</span>
              </span>
            </Link>

            {/* Navigation */}
            <nav className="space-y-1">
              <NavItem href="/dashboard" icon="⌂" label="Dashboard" active />

              <NavItem href="/dashboard/startups" icon="💡" label="My Ideas" />

              <NavItem
                href="/dashboard/analyze"
                icon="✦"
                label="Analyze Idea"
              />

              <NavItem href="/dashboard/analytics" icon="◔" label="Analytics" />

              <NavItem
                href="/dashboard/requests"
                icon="💰"
                label="Investor Requests"
                badge="4"
              />
            </nav>

            <div className="my-6 border-t border-slate-200 dark:border-slate-800" />

            <nav className="space-y-1">
              <NavItem
                href="/dashboard/notifications"
                icon="🔔"
                label="Notifications"
              />

              <NavItem href="/dashboard/settings" icon="⚙" label="Settings" />
            </nav>

            {/* Bottom CTA */}
            <div className="mt-auto rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
                Have another idea?
              </p>

              <p className="mt-1 text-xs leading-5 text-indigo-600 dark:text-indigo-400">
                Let AI validate your next business idea.
              </p>

              <Link
                href="/analyze"
                className="mt-3 block rounded-lg bg-indigo-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Analyze Idea →
              </Link>
            </div>
          </div>
        </aside>

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
