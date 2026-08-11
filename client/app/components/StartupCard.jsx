
import Link from "next/link";

const StartupCard = ({ startup }) => {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:shadow-black/20">

      <div className="flex flex-col gap-6 lg:flex-row">

        {/* ================= LEFT ================= */}
        <div className="flex-1">

          {/* Header */}
          <div className="flex items-start gap-4">

            {/* Startup Logo */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              {startup.name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {startup.name}
                </h3>

                {startup.trending && (
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    🔥 TRENDING
                  </span>
                )}

              </div>

              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                {startup.tagline}
              </p>

            </div>
          </div>

          {/* Description */}
          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {startup.description}
          </p>

          {/* Tags */}
          <div className="mt-5 flex flex-wrap gap-2">

            {startup.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}

          </div>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 dark:text-slate-500">

            <span>
              📍 {startup.location}
            </span>

            <span>
              👥 {startup.founders}
            </span>

            <span>
              🚀 {startup.stage}
            </span>

          </div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex shrink-0 flex-col justify-between border-t border-slate-100 pt-5 dark:border-slate-800 lg:w-60 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">

          {/* AI SCORE */}
          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              AI Validation
            </p>

            <div className="mt-3 flex items-center gap-3">

              <div className="flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40">

                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {startup.score}
                </span>

              </div>

              <div>

                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {startup.score >= 85
                    ? "Strong Potential"
                    : startup.score >= 75
                    ? "Good Potential"
                    : "Needs Validation"}
                </p>

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Risk:{" "}
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {startup.risk}
                  </span>
                </p>

              </div>

            </div>

          </div>

          {/* FUNDING */}
          <div className="mt-5">

            <p className="text-xs text-slate-400 dark:text-slate-500">
              Funding Required
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {startup.funding}
            </p>

          </div>

          {/* BUTTON */}
          <Link
            href={`/startup/${startup.id}`}
            className="mt-5 flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            View Startup →
          </Link>

        </div>

      </div>

    </article>
  );
};

export default StartupCard;

