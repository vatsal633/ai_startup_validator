"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  LoaderCircle,
  RefreshCw,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  deleteIdea,
  getIdea,
  publishIdea,
  retryAnalysis,
  unpublishIdea,
} from "@/lib/endpoints";
import {
  STATUS_STYLES,
  formatDate,
  formatFunding,
  statusLabel,
} from "@/lib/ideaOptions";

/** The founder's own answers, in the order the form asked for them. */
const SUBMITTED_FIELDS = [
  ["idea", "The idea"],
  ["problem", "Problem"],
  ["solution", "Solution"],
  ["target_customer", "Target customer"],
  ["differentiator", "What makes it different"],
  ["competitors", "Competitors"],
];

/** Report sections, grouped the way a reader would work through them. */
const REPORT_SECTIONS = [
  {
    heading: "The opportunity",
    fields: [
      ["executive_summary", "Executive summary"],
      ["problem_validation", "Problem validation"],
      ["solution_evaluation", "Solution evaluation"],
    ],
  },
  {
    heading: "Customers and market",
    fields: [
      ["target_customer_analysis", "Target customer analysis"],
      ["customer_segments", "Customer segments"],
      ["market_trends", "Market trends"],
    ],
  },
  {
    heading: "Competition",
    fields: [
      ["competitor_analysis", "Competitor analysis"],
      ["competitive_advantage", "Competitive advantage"],
    ],
  },
  {
    heading: "Business and money",
    fields: [
      ["business_model_analysis", "Business model analysis"],
      ["revenue_potential", "Revenue potential"],
      ["funding_recommendation", "Funding recommendation"],
    ],
  },
  {
    heading: "Getting to market",
    fields: [
      ["go_to_market_strategy", "Go-to-market strategy"],
      ["risk_analysis", "Risks"],
      ["recommendations", "Recommendations"],
    ],
  },
];

function scoreTone(score) {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-bold">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export default function IdeaDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoading(true);
      try {
        setIdea(await getIdea(id));
        if (!quiet) setError("");
      } catch (err) {
        if (!quiet) setError(err.message);
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    load();
  }, [load]);

  // the analysis runs in a background thread server-side; poll until it settles
  useEffect(() => {
    if (idea?.status !== "processing") return;
    const timer = setInterval(() => load({ quiet: true }), 4000);
    return () => clearInterval(timer);
  }, [idea?.status, load]);

  const run = async (action, fn) => {
    setBusy(action);
    setActionError("");
    try {
      const result = await fn();
      if (action === "delete") {
        router.push("/founder/myideas");
        return;
      }
      setIdea((current) => ({ ...current, ...result }));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] dark:bg-slate-950">
        <LoaderCircle size={26} className="animate-spin text-indigo-600" />
      </main>
    );
  }

  // this route lives under /founder/myideas/, so someone else's idea does not
  // belong here even when the API is willing to show its public summary
  if (idea && idea.is_owner === false) {
    return (
      <main className="min-h-screen w-full bg-[#f8fafc] p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="font-semibold">This isn&apos;t one of your ideas</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            You can only manage ideas you submitted. Browse other startups on the
            marketplace instead.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/founder/myideas"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              My Ideas
            </Link>
            <Link
              href="/startups"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full bg-[#f8fafc] p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/40">
          <TriangleAlert className="mx-auto text-rose-500" />
          <p className="mt-3 font-semibold text-rose-700 dark:text-rose-300">
            Couldn&apos;t load this idea
          </p>
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <Link
            href="/founder/myideas"
            className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to My Ideas
          </Link>
        </div>
      </main>
    );
  }

  const report = idea.report;
  const score = report?.ai_validation_score;
  const market = report?.market_size;

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <Link
          href="/founder/myideas"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400"
        >
          <ArrowLeft size={15} /> Back to My Ideas
        </Link>

        {/* ---------------------------------------------------------- header */}
        <header className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{idea.title}</h1>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  STATUS_STYLES[idea.status] ?? STATUS_STYLES.draft
                }`}
              >
                {statusLabel(idea.status)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                {idea.industry}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                {idea.stage_display}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                {idea.business_model_display}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                {idea.country}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatFunding(idea.funding_requirement)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> {idea.view_count} {idea.view_count === 1 ? "view" : "views"}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} /> {idea.request_count}{" "}
                {idea.request_count === 1 ? "request" : "requests"}
              </span>
              <span>Created {formatDate(idea.created_at)}</span>
              {idea.published_at && <span>Published {formatDate(idea.published_at)}</span>}
            </div>
          </div>

          {/* ------------------------------------------------------- actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {idea.status === "processing" && (
              <span className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-4 py-2.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                <LoaderCircle size={14} className="animate-spin" /> Analyzing…
              </span>
            )}

            {idea.status === "failed" && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("retry", () => retryAnalysis(idea.id))}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold transition hover:bg-white disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-900"
              >
                {busy === "retry" ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Retry analysis
              </button>
            )}

            {idea.status === "draft" && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("publish", () => publishIdea(idea.id))}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700"
              >
                {busy === "publish" && <LoaderCircle size={14} className="animate-spin" />}
                Publish
              </button>
            )}

            {idea.status === "published" && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("unpublish", () => unpublishIdea(idea.id))}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold transition hover:bg-white disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-900"
              >
                {busy === "unpublish" && <LoaderCircle size={14} className="animate-spin" />}
                Unpublish
              </button>
            )}

            {idea.status !== "processing" && (
              <button
                type="button"
                aria-label={`Delete ${idea.title}`}
                disabled={busy !== null}
                onClick={() => {
                  if (window.confirm(`Delete "${idea.title}"? This can't be undone.`)) {
                    run("delete", () => deleteIdea(idea.id));
                  }
                }}
                className="rounded-lg border border-slate-200 p-2.5 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-60 dark:border-slate-700 dark:hover:border-rose-900"
              >
                {busy === "delete" ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            )}
          </div>
        </header>

        {actionError && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {actionError}
          </p>
        )}

        {/* ------------------------------------------------- state callouts */}
        {idea.status === "processing" && (
          <p className="mt-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
            The AI analysis is running. This page refreshes itself when the report is
            ready — you can leave and come back.
          </p>
        )}

        {idea.status === "failed" && (
          <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            The AI analysis failed, so there&apos;s no report yet and this idea
            can&apos;t be published. Use <strong>Retry analysis</strong> to run it again.
          </p>
        )}

        {idea.status === "draft" && report && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            This idea is private. Review the report below, then <strong>Publish</strong>{" "}
            to make the public summary visible to investors.
          </p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-6">
            {/* ------------------------------------------ submitted details */}
            <Card
              title="What you submitted"
              subtitle="The details the analysis was based on."
            >
              {SUBMITTED_FIELDS.map(([field, label]) => (
                <Field key={field} label={label} value={idea[field]} />
              ))}
            </Card>

            {/* ------------------------------------------------- the report */}
            {report ? (
              REPORT_SECTIONS.map(({ heading, fields }) => {
                const populated = fields.filter(([field]) => report[field]);
                if (populated.length === 0) return null;

                return (
                  <Card key={heading} title={heading}>
                    {populated.map(([field, label]) => (
                      <Field key={field} label={label} value={report[field]} />
                    ))}
                  </Card>
                );
              })
            ) : (
              <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="font-semibold">No AI report yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {idea.status === "processing"
                    ? "The analysis is still running."
                    : "Run the analysis to generate one."}
                </p>
              </section>
            )}
          </div>

          {/* ------------------------------------------------------ sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                AI validation score
              </p>
              {typeof score === "number" ? (
                <>
                  <p className={`mt-3 text-5xl font-bold ${scoreTone(score)}`}>
                    {Math.round(score)}
                    <span className="text-xl font-medium text-slate-400">/100</span>
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                      style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    Decision support, not a guarantee — weigh it with your own research.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-4xl font-bold text-slate-300 dark:text-slate-700">—</p>
              )}
            </div>

            {market && (market.tam || market.sam || market.som) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="font-bold">Market size</h2>
                <dl className="mt-4 space-y-4">
                  {[
                    ["TAM", "Total addressable", market.tam],
                    ["SAM", "Serviceable addressable", market.sam],
                    ["SOM", "Serviceable obtainable", market.som],
                  ].map(([abbr, full, value]) =>
                    value ? (
                      <div key={abbr}>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                          {abbr}{" "}
                          <span className="font-normal normal-case tracking-normal text-slate-400">
                            {full}
                          </span>
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {value}
                        </dd>
                      </div>
                    ) : null
                  )}
                </dl>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
