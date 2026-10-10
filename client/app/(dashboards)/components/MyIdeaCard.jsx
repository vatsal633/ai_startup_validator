"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, LoaderCircle, RefreshCw, Trash2, Users } from "lucide-react";
import {
  STATUS_STYLES,
  formatFunding,
  stageLabel,
  statusLabel,
} from "@/lib/ideaOptions";
import { deleteIdea, publishIdea, retryAnalysis, unpublishIdea } from "@/lib/endpoints";

/**
 * One of the founder's own ideas, with the publish controls.
 * `onChanged` receives the updated idea, or null when it was deleted.
 */
export default function MyIdeaCard({ idea, onChanged }) {
  const [busy, setBusy] = useState(null); // "publish" | "unpublish" | "delete"
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const run = async (action, fn) => {
    setBusy(action);
    setError("");
    try {
      const result = await fn();
      onChanged?.(action === "delete" ? null : result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
      setConfirmingDelete(false);
    }
  };

  const score = idea.ai_validation_score;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Link
          href={`/founder/myideas/${idea.id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
        >
          {(idea.title || "?").charAt(0).toUpperCase()}
        </Link>

        <Link href={`/founder/myideas/${idea.id}`} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold transition group-hover:text-indigo-600">
              {idea.title}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                STATUS_STYLES[idea.status] ?? STATUS_STYLES.draft
              }`}
            >
              {statusLabel(idea.status)}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {idea.short_description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {idea.industry}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {stageLabel(idea.stage)}
            </span>
            <span className="text-xs text-slate-400">
              {formatFunding(idea.funding_requirement)}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-5 dark:sm:border-slate-800">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              AI Score
            </p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {score ?? "—"}
            </p>
          </div>

          <div className="hidden space-y-1 text-right sm:block">
            <p className="flex items-center justify-end gap-1 text-xs text-slate-400">
              <Eye size={13} /> {idea.view_count ?? 0} views
            </p>
            <p className="flex items-center justify-end gap-1 text-xs text-slate-400">
              <Users size={13} /> {idea.request_count ?? 0} requests
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {idea.status === "processing" && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              <LoaderCircle size={13} className="animate-spin" />
              Analyzing…
            </span>
          )}

          {idea.status === "failed" && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run("retry", () => retryAnalysis(idea.id))}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {busy === "retry" ? (
                <LoaderCircle size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              Retry analysis
            </button>
          )}

          {idea.status === "draft" && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run("publish", () => publishIdea(idea.id))}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
            >
              {busy === "publish" && <LoaderCircle size={13} className="animate-spin" />}
              Publish
            </button>
          )}

          {idea.status === "published" && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run("unpublish", () => unpublishIdea(idea.id))}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {busy === "unpublish" && <LoaderCircle size={13} className="animate-spin" />}
              Unpublish
            </button>
          )}

          {idea.status === "processing" ? null : confirmingDelete ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("delete", () => deleteIdea(idea.id))}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {busy === "delete" && <LoaderCircle size={13} className="animate-spin" />}
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              aria-label={`Delete ${idea.title}`}
              disabled={busy !== null}
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-60 dark:border-slate-700 dark:hover:border-rose-900"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {idea.status === "failed" && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          The AI analysis failed for this idea, so it can&apos;t be published yet.
          Use <strong>Retry analysis</strong> to run it again.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
