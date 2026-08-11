import React from 'react'
import Link from 'next/link';

const StartupCard = ({startup }) => {
   return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

        {/* LOGO */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          {startup.name.charAt(0)}
        </div>


        {/* INFO */}
        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="font-bold">
              {startup.name}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                startup.status === "Published"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
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

            <span className="text-xs text-slate-400">
              {startup.funding}
            </span>

          </div>

        </div>


        {/* SCORE */}
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

            <p className="text-xs text-slate-400">
              {startup.views} views
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {startup.requests} requests
            </p>

          </div>

        </div>


        {/* ACTION */}
        <Link
          href={`/startup/${startup.name === "FarmSense AI" ? "1" : startup.name === "SkillBridge" ? "2" : "3"}`}
          className="rounded-lg border border-slate-200 px-4 py-2 text-center text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          View
        </Link>

      </div>

    </div>
  );
}

export default StartupCard