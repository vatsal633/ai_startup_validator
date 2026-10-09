"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  CircleHelp,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { initialForm, isFormComplete } from "@/lib/formfields";
import { BUSINESS_MODELS, INDUSTRIES, STAGES } from "@/lib/ideaOptions";
import { submitIdea } from "@/lib/endpoints";

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900";
const textareaClass = `${inputClass} resize-y leading-6`;
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

const Required = () => <span className="text-indigo-500">*</span>;

const AnalyzeIdeaFrom = () => {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsAnalyzing(true);

    try {
      await submitIdea({
        ...form,
        // the API takes a decimal; the input gives a string
        funding_requirement: Number(form.funding_requirement),
      });

      // the API returns as soon as the idea is saved; the analysis runs in the
      // background, and My Ideas polls until it finishes
      router.push("/founder/myideas");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = isFormComplete(form);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="border-b border-slate-200 px-5 py-5 sm:px-7 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <Lightbulb size={20} />
          </div>
          <div>
            <h2 className="font-bold">Tell us about the idea</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              A few focused details are all we need to get started.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-7">
        <div className="grid gap-5 sm:grid-cols-[1fr_190px]">
          <label className={labelClass}>
            Idea name <Required />
            <input
              required
              maxLength={150}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. FarmSense AI"
              className={inputClass}
            />
          </label>

          <label className={`relative ${labelClass}`}>
            Industry <Required />
            <select
              required
              value={form.industry}
              onChange={(event) => updateField("industry", event.target.value)}
              className={`${inputClass} appearance-none`}
            >
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400"
            />
          </label>
        </div>

        <label className={labelClass}>
          Describe the idea in a sentence or two <Required />
          <textarea
            required
            rows={3}
            value={form.idea}
            onChange={(event) => updateField("idea", event.target.value)}
            placeholder="e.g. A mobile app that detects crop disease from a photo and recommends treatment."
            className={textareaClass}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            What problem does it solve? <Required />
            <textarea
              required
              rows={4}
              value={form.problem}
              onChange={(event) => updateField("problem", event.target.value)}
              placeholder="Who is hurting today, and how badly?"
              className={textareaClass}
            />
          </label>

          <label className={labelClass}>
            How does it solve that? <Required />
            <textarea
              required
              rows={4}
              value={form.solution}
              onChange={(event) => updateField("solution", event.target.value)}
              placeholder="The approach, in plain terms."
              className={textareaClass}
            />
          </label>
        </div>

        <label className={labelClass}>
          Who is it for? <Required />
          <input
            required
            value={form.target_customer}
            onChange={(event) => updateField("target_customer", event.target.value)}
            placeholder="e.g. Independent farmers managing 10-50 acres"
            className={inputClass}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Target country / market <Required />
            <input
              required
              maxLength={100}
              value={form.country}
              onChange={(event) => updateField("country", event.target.value)}
              placeholder="e.g. India"
              className={inputClass}
            />
          </label>

          <label className={`relative ${labelClass}`}>
            How will you make money? <Required />
            <select
              required
              value={form.business_model}
              onChange={(event) => updateField("business_model", event.target.value)}
              className={`${inputClass} appearance-none`}
            >
              <option value="">Select a business model</option>
              {BUSINESS_MODELS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400"
            />
          </label>
        </div>

        <fieldset>
          <legend className={labelClass}>
            What stage is your startup at? <Required />
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map(({ value, label }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-950"
              >
                <input
                  required
                  type="radio"
                  name="stage"
                  value={value}
                  checked={form.stage === value}
                  onChange={(event) => updateField("stage", event.target.value)}
                  className="h-4 w-4 accent-indigo-600"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            How much funding are you looking for? <Required />
            <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:bg-slate-900">
              <span className="mr-2 text-sm text-slate-500">₹</span>
              <input
                required
                type="number"
                min="0"
                step="1000"
                value={form.funding_requirement}
                onChange={(event) => updateField("funding_requirement", event.target.value)}
                placeholder="1000000"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className={labelClass}>
            Who are your competitors?{" "}
            <span className="font-normal text-slate-400">(optional)</span>
            <textarea
              rows={3}
              value={form.competitors}
              onChange={(event) => updateField("competitors", event.target.value)}
              placeholder="List known competitors or alternatives"
              className={textareaClass}
            />
          </label>
        </div>

        <label className={labelClass}>
          What makes your approach different? <Required />
          <textarea
            required
            rows={3}
            value={form.differentiator}
            onChange={(event) => updateField("differentiator", event.target.value)}
            placeholder="Share any unique insight, technology, or unfair advantage..."
            className={textareaClass}
          />
        </label>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <TriangleAlert size={17} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isAnalyzing && (
          <p className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            Saving your idea — the AI analysis will keep running in the background
            once you land on My Ideas.
          </p>
        )}

        <div className="flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center dark:border-slate-800">
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <CircleHelp size={15} /> Your draft stays private until you publish it.
          </p>
          <button
            type="submit"
            disabled={!canAnalyze || isAnalyzing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            {isAnalyzing ? (
              <>
                <LoaderCircle size={17} className="animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles size={17} /> Generate analysis
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AnalyzeIdeaFrom;
