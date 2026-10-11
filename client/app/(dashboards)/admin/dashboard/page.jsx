"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, LoaderCircle, TriangleAlert } from "lucide-react";
import { getAdminStats } from "@/lib/endpoints";
import { formatDate, formatFunding, stageLabel } from "@/lib/ideaOptions";
import { relativeTime } from "@/lib/relativeTime";

function Stat({ label, value, hint, tone = "" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value ?? "—"}</p>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-bold">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Horizontal bars for a {label: count} map. */
function BreakdownBars({ data, empty = "Nothing yet.", capitalize = false }) {
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{empty}</p>;
  }
  const max = Math.max(...entries.map(([, n]) => n));

  return (
    <ul className="space-y-3">
      {entries.map(([label, count]) => (
        <li key={label}>
          <div className="flex items-center justify-between text-sm">
            <span
              className={`text-slate-700 dark:text-slate-300 ${
                capitalize ? "capitalize" : ""
              }`}
            >
              {label}
            </span>
            <span className="font-semibold tabular-nums">{count}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${max ? (count / max) * 100 : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Score histogram. The point of showing it is to make clustering obvious —
 * if every idea lands in one or two bands, the score is not discriminating
 * between ideas and should not be read as one.
 */
const NARROW_SPREAD = 25; // points; below this the score is barely separating ideas
const ENOUGH_TO_JUDGE = 5; // reports; fewer than this and a narrow spread means little

function ScoreHistogram({ distribution, spread, scored, average }) {
  const entries = Object.entries(distribution ?? {});
  const max = Math.max(1, ...entries.map(([, n]) => n));
  const clustered =
    scored >= ENOUGH_TO_JUDGE && spread !== null && spread < NARROW_SPREAD;

  return (
    <>
      <div className="flex h-40 items-end gap-1.5">
        {entries.map(([band, count]) => (
          <div key={band} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold tabular-nums text-slate-400">
              {count || ""}
            </span>
            <div
              title={`${band}: ${count}`}
              className={`w-full rounded-t ${
                count ? "bg-indigo-500" : "bg-slate-100 dark:bg-slate-800"
              }`}
              style={{ height: `${count ? Math.max((count / max) * 100, 6) : 2}%` }}
            />
            <span className="text-[9px] text-slate-400">{band.split("-")[0]}</span>
          </div>
        ))}
      </div>

      {clustered && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            All {scored} scores sit within {spread} points of each other, averaging{" "}
            {average}. The model is rating every idea about the same, so the score is
            not currently separating strong submissions from weak ones — worth
            treating as a formality until the prompt pushes it to use the full range.
          </span>
        </p>
      )}
    </>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setStats(await getAdminStats());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] dark:bg-slate-950">
        <LoaderCircle size={26} className="animate-spin text-indigo-600" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full bg-[#f8fafc] p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/40">
          <TriangleAlert className="mx-auto text-rose-500" />
          <p className="mt-3 font-semibold text-rose-700 dark:text-rose-300">
            Couldn&apos;t load platform statistics
          </p>
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      </main>
    );
  }

  const { overview, pipeline, funnel, marketplace, moderation } = stats;
  const hasPipelineTrouble = pipeline.stuck_processing > 0 || pipeline.analyses_failed > 0;

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <section className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">Administration</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Platform overview</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Generated {relativeTime(stats.generated_at)}. Figures are computed live
            from the database.
          </p>
        </section>

        {/* ------------------------------------------------------ overview */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Users"
            value={overview.users_total}
            hint={`${overview.signups_last_30_days} joined in 30 days`}
          />
          <Stat
            label="Ideas"
            value={overview.ideas_total}
            hint={`${overview.ideas_last_30_days} submitted in 30 days`}
          />
          <Stat
            label="Published"
            value={funnel.published_ideas}
            hint="Live on the marketplace"
          />
          <Stat
            label="Access requests"
            value={funnel.requests_total}
            hint={
              funnel.accept_rate_percent === null
                ? "None answered yet"
                : `${funnel.accept_rate_percent}% accepted`
            }
          />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* ------------------------------------------------ AI pipeline */}
          <Panel
            title="AI pipeline health"
            subtitle="Whether analyses are completing, and whether the scores mean anything."
          >
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {pipeline.analyses_succeeded}
                </p>
                <p className="mt-1 text-xs text-slate-400">Succeeded</p>
              </div>
              <div>
                <p
                  className={`text-2xl font-bold ${
                    pipeline.analyses_failed ? "text-rose-600" : "text-slate-300"
                  }`}
                >
                  {pipeline.analyses_failed}
                </p>
                <p className="mt-1 text-xs text-slate-400">Failed</p>
              </div>
              <div>
                <p
                  className={`text-2xl font-bold ${
                    pipeline.stuck_processing ? "text-amber-600" : "text-slate-300"
                  }`}
                >
                  {pipeline.stuck_processing}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Stuck &gt;{pipeline.stuck_threshold_minutes}m
                </p>
              </div>
            </div>

            {hasPipelineTrouble && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {pipeline.failure_rate_percent}% of finished analyses failed.
                {pipeline.failed_awaiting_retry > 0 &&
                  ` ${pipeline.failed_awaiting_retry} idea(s) are waiting for a founder to retry.`}
              </p>
            )}

            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">Score distribution</h3>
                <p className="text-xs text-slate-400">
                  avg {pipeline.score_average ?? "—"} · range{" "}
                  {pipeline.score_lowest ?? "—"}–{pipeline.score_highest ?? "—"}
                </p>
              </div>
              <div className="mt-3">
                <ScoreHistogram
                  distribution={pipeline.score_distribution}
                  spread={pipeline.score_spread}
                  scored={pipeline.scored_reports}
                  average={pipeline.score_average}
                />
              </div>
            </div>
          </Panel>

          {/* --------------------------------------------- connection loop */}
          <Panel
            title="Connection funnel"
            subtitle="Whether published ideas are actually reaching investors."
          >
            <BreakdownBars
              data={funnel.requests_by_status}
              empty="No investor has requested access yet."
              capitalize
            />

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">
                  Published with no requests
                </dt>
                <dd
                  className={`font-semibold tabular-nums ${
                    funnel.published_with_no_requests === funnel.published_ideas &&
                    funnel.published_ideas > 0
                      ? "text-amber-600"
                      : ""
                  }`}
                >
                  {funnel.published_with_no_requests} of {funnel.published_ideas}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">
                  Pending over 7 days
                </dt>
                <dd className="font-semibold tabular-nums">
                  {funnel.pending_over_7_days}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">
                  Median time to accept
                </dt>
                <dd className="font-semibold tabular-nums">
                  {funnel.median_hours_to_accept === null
                    ? "—"
                    : `${funnel.median_hours_to_accept}h`}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              Declines carry no timestamp, so only acceptances have a measurable
              turnaround.
            </p>
          </Panel>

          {/* ------------------------------------------------ marketplace */}
          <Panel
            title="Marketplace composition"
            subtitle="What is actually listed, and how concentrated it is."
          >
            <h3 className="text-sm font-semibold">By industry</h3>
            <div className="mt-3">
              <BreakdownBars data={marketplace.by_industry} />
            </div>

            <h3 className="mt-6 text-sm font-semibold">By stage</h3>
            <div className="mt-3">
              <BreakdownBars
                data={Object.fromEntries(
                  Object.entries(marketplace.by_stage ?? {}).map(([k, v]) => [
                    stageLabel(k),
                    v,
                  ])
                )}
              />
            </div>

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Total sought</dt>
                <dd className="font-semibold">
                  {formatFunding(marketplace.total_funding_sought)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Average ask</dt>
                <dd className="font-semibold">
                  {formatFunding(marketplace.average_funding_sought)}
                </dd>
              </div>
            </dl>
          </Panel>

          {/* ------------------------------------------------- moderation */}
          <Panel
            title="Recently published"
            subtitle="The newest listings, for a sanity check on what is going live."
          >
            {moderation.recently_published.length > 0 ? (
              <ul className="space-y-3">
                {moderation.recently_published.map((idea) => (
                  <li
                    key={idea.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/startups/${idea.id}`}
                        className="text-sm font-semibold transition hover:text-indigo-600"
                      >
                        {idea.title}
                      </Link>
                      <p className="truncate text-xs text-slate-400">
                        {idea.industry} · {idea.founder}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-indigo-600">
                        {idea.score ?? "—"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(idea.published_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nothing published yet.
              </p>
            )}

            <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {moderation.low_scoring_published > 0
                ? `${moderation.low_scoring_published} published idea(s) scored under 50. `
                : "No published idea scored under 50. "}
              There is no flagging or takedown feature yet — removals go through the
              Django admin.
            </p>
          </Panel>
        </div>
      </div>
    </main>
  );
}
