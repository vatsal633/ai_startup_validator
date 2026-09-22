import React from "react";
import Link from "next/link";
import StatCard from "../../components/StateCard";
import QuickAction from "../../components/QuickAction";
import Activity from "../../components/Activity";

const investments = [
  {
    name: "FarmSense AI",
    description: "AI-powered crop disease detection for farmers",
    category: "AgriTech",
    stage: "Seed",
    score: 87,
    match: 92,
    views: 124,
    funding: "₹1.2 Cr",
    status: "High fit",
  },
  {
    name: "SkillBridge",
    description: "AI-powered personalized career learning platform",
    category: "EdTech",
    stage: "Pre-Seed",
    score: 82,
    match: 88,
    views: 89,
    funding: "₹80 Lakh",
    status: "Hot",
  },
  {
    name: "MediTrack",
    description: "Smart medication management platform",
    category: "HealthTech",
    stage: "Prototype",
    score: 76,
    match: 81,
    views: 43,
    funding: "₹60 Lakh",
    status: "Review",
  },
];

const activities = [
  {
    icon: "📩",
    title: "New startup intro request",
    description: "FarmSense AI shared a founder update and investor deck",
    time: "12 minutes ago",
  },
  {
    icon: "📈",
    title: "Pipeline updated",
    description: "Your deal score for SkillBridge increased by 7 points",
    time: "2 hours ago",
  },
  {
    icon: "🔔",
    title: "Investor follow-up due",
    description: "3 founders are waiting for your response this week",
    time: "Yesterday",
  },
];

const investorDashboard = () => {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="flex">
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-indigo-600">Overview</p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Good morning, Investor 👋
                </h1>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Here&apos;s what&apos;s happening across your portfolio and startup pipeline.
                </p>
              </div>

              <Link
                href="/startups"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Discover Startups
              </Link>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon="💰" label="Portfolio Value" value="₹2.4 Cr" change="+8.4%" />
              <StatCard icon="🤝" label="Active Deals" value="4" change="+2 this month" />
              <StatCard icon="⭐" label="Watchlist" value="12" change="+5 this week" />
              <StatCard icon="📊" label="Avg. AI Score" value="84" change="+3.1%" />
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="min-w-0">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Recommended Startups</h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      High-potential startups matched to your investment thesis.
                    </p>
                  </div>

                  <Link
                    href="/startups"
                    className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    View all →
                  </Link>
                </div>

                <div className="space-y-4">
                  {investments.map((startup) => (
                    <div
                      key={startup.name}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                          {startup.name.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">{startup.name}</h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                startup.status === "High fit"
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                                  : startup.status === "Hot"
                                    ? "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                                    : "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                              }`}
                            >
                              {startup.status}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                            {startup.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {startup.category}
                            </span>

                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {startup.stage}
                            </span>

                            <span className="text-xs text-slate-400">{startup.funding}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-5 dark:sm:border-slate-800">
                          <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              AI Score
                            </p>
                            <p className="mt-1 text-2xl font-bold text-indigo-600">
                              {startup.score}
                            </p>
                          </div>

                          <div className="hidden text-right sm:block">
                            <p className="text-xs text-slate-400">{startup.match}% match</p>
                            <p className="mt-1 text-xs text-slate-400">{startup.views} views</p>
                          </div>
                        </div>

                        <Link
                          href={`/startup/${startup.name === "FarmSense AI" ? "1" : startup.name === "SkillBridge" ? "2" : "3"}`}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-center text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="font-bold">Quick Actions</h2>

                  <div className="mt-4 space-y-2">
                    <QuickAction
                      href="/startups"
                      icon="🔎"
                      title="Discover Startups"
                      description="Browse curated opportunities"
                    />

                    <QuickAction
                      href="/dashboard/requests"
                      icon="📁"
                      title="Review Decks"
                      description="Check investor materials"
                    />

                    <QuickAction
                      href="/dashboard/notifications"
                      icon="📬"
                      title="Follow-ups"
                      description="5 conversations waiting"
                    />
                  </div>
                </div>

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
                    Your strongest match is <strong>FarmSense AI</strong> with a 92% investment fit score and strong operational traction.
                  </p>

                  <Link
                    href="/startup/1"
                    className="mt-4 block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View full analysis →
                  </Link>
                </div>

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

export default investorDashboard;
