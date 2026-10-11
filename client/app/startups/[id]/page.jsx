"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Lock,
  LoaderCircle,
  TriangleAlert,
  Unlock,
} from "lucide-react";
import ThemeToggle from "../../components/ui/themeToggle";
import {
  MarketSizeCard,
  ReportSections,
  ScoreCard,
  SubmittedDetails,
} from "../../components/IdeaReport";
import { getIdea, requestConnection } from "@/lib/endpoints";
import { formatDate, formatFunding, stageLabel } from "@/lib/ideaOptions";
import { isAuthenticated } from "@/lib/auth";
import { relativeTime } from "@/lib/relativeTime";

const REQUEST_NOTE = {
  pending: {
    icon: Clock,
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    text: "Your access request is with the founder. You'll be notified when they respond.",
  },
  accepted: {
    icon: Unlock,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    text: "The founder accepted your request, so you can see the full analysis below.",
  },
  declined: {
    icon: Lock,
    className:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
    text: "The founder declined your request, so only the public summary is shown.",
  },
};

export default function PublicIdeaPage() {
  const { id } = useParams();

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setIdea(await getIdea(id));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // localStorage is only readable on the client
    setSignedIn(isAuthenticated());
    load();
  }, [load]);

  const handleRequest = async () => {
    setRequesting(true);
    setRequestError("");
    try {
      await requestConnection(idea.id);
      await load();
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setRequesting(false);
    }
  };

  const shell = (children) => (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-5xl px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Venture<span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/startups"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300"
            >
              Marketplace
            </Link>
            {!signedIn && (
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300"
              >
                Sign in
              </Link>
            )}
            <ThemeToggle />
          </div>
        </nav>
        {children}
      </div>
    </main>
  );

  if (loading) {
    return shell(
      <div className="flex items-center justify-center py-32">
        <LoaderCircle size={26} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return shell(
      <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <TriangleAlert className="mx-auto text-amber-500" />
        <p className="mt-3 font-semibold">This startup isn&apos;t available</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <Link
          href="/startups"
          className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to the marketplace
        </Link>
      </div>
    );
  }

  const report = idea.report;
  const note = REQUEST_NOTE[idea.my_connection_status];
  const NoteIcon = note?.icon;

  return shell(
    <>
      <Link
        href="/startups"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft size={15} /> Back to the marketplace
      </Link>

      <header className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">{idea.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
              {idea.industry}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
              {idea.stage_display ?? stageLabel(idea.stage)}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
              {idea.country}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatFunding(idea.funding_requirement)}
            </span>
            {idea.founder_name && <span>by {idea.founder_name}</span>}
            <span>
              {idea.published_at
                ? `Published ${formatDate(idea.published_at)}`
                : `Listed ${relativeTime(idea.created_at)}`}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {idea.can_request_access && (
            <button
              type="button"
              onClick={handleRequest}
              disabled={requesting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
            >
              {requesting && <LoaderCircle size={15} className="animate-spin" />}
              Request full access
            </button>
          )}

          {!signedIn && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Sign in to request access
            </Link>
          )}
        </div>
      </header>

      {requestError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {requestError}
        </p>
      )}

      {note && (
        <p
          className={`mt-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${note.className}`}
        >
          <NoteIcon size={16} /> {note.text}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          {report ? (
            <>
              <SubmittedDetails
                idea={idea}
                title="About this startup"
                subtitle="The details the analysis was based on."
              />
              <ReportSections report={report} />
            </>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="font-bold">About this startup</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {idea.idea}
                </p>
              </section>

              {/* the teaser is all the API returned, so say why rather than
                  leaving the page looking broken */}
              <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <Lock size={24} className="mx-auto text-slate-300" />
                <p className="mt-3 font-semibold">The full analysis is private</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                  The founder shares the problem detail, solution, competitors and the
                  complete AI report with investors they approve.
                  {!signedIn && " Sign in as an investor to request access."}
                </p>
                {idea.can_request_access && (
                  <button
                    type="button"
                    onClick={handleRequest}
                    disabled={requesting}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700"
                  >
                    {requesting && <LoaderCircle size={15} className="animate-spin" />}
                    Request full access
                  </button>
                )}
              </section>
            </>
          )}
        </div>

        <aside className="space-y-6">
          <ScoreCard score={idea.ai_validation_score ?? report?.ai_validation_score} />
          <MarketSizeCard market={report?.market_size} />
        </aside>
      </div>
    </>
  );
}
