"use client";
import React, { useState } from "react";
import { initialForm } from "@/lib/formfields";
import {
  Lightbulb,
  ChevronDown,
  CircleHelp,
  LoaderCircle,
  Sparkles,
  Check,
} from "lucide-react";

const categories = [
  "SaaS",
  "Fintech",
  "Healthtech",
  "E-commerce",
  "Climate",
  "Other",
];

const businessModels = [
  "Subscription",
  "Commission",
  "One-time purchase",
  "Freemium",
  "Advertising",
  "Other",
];

const startupStages = [
  "Just an idea",
  "Prototype",
  "MVP",
  "Launched",
  "Generating revenue",
];

const AnalyzeIdeaFrom = () => {
  const [form, setForm] = useState(initialForm);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setHasResult] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(form);
    
    setIsAnalyzing(true);
    window.setTimeout(() => {
      setIsAnalyzing(false);
      setHasResult(true);
    }, 900);
  };

  const canAnalyze =
    form.name.trim() && form.description.trim() && form.audience.trim();
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-200 px-5 py-5 sm:px-7 dark:border-slate-800">
          {/* form header */}
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Idea name <span className="text-indigo-500">*</span>
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. FarmSense AI"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900"
              />
            </label>
            <label className="relative block text-sm font-medium text-slate-700 dark:text-slate-300">
              Industry
              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className="mt-2 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            What problem does it solve?{" "}
            <span className="text-indigo-500">*</span>
            <textarea
              required
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={5}
              placeholder="Describe the problem, your proposed solution, and why it matters..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Who is it for? <span className="text-indigo-500">*</span>
            <input
              required
              value={form.audience}
              onChange={(event) => updateField("audience", event.target.value)}
              placeholder="e.g. Independent farmers managing 10-50 acres"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Target country / market <span className="text-indigo-500">*</span>
              <input
                required
                value={form.target_country}
                onChange={(event) => updateField("target_country", event.target.value)}
                placeholder="e.g. India, urban consumers"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900"
              />
            </label>
            <label className="relative block text-sm font-medium text-slate-700 dark:text-slate-300">
              How will you make money? <span className="text-indigo-500">*</span>
              <select
                required
                value={form.business_model}
                onChange={(event) => updateField("business_model", event.target.value)}
                className="mt-2 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Select a business model</option>
                {businessModels.map((businessModel) => (
                  <option key={businessModel} value={businessModel}>{businessModel}</option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400" />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
              What stage is your startup at? <span className="text-indigo-500">*</span>
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {startupStages.map((stage) => (
                <label key={stage} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                  <input
                    required
                    type="radio"
                    name="startup_stage"
                    value={stage}
                    checked={form.startup_stage === stage}
                    onChange={(event) => updateField("startup_stage", event.target.value)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  {stage}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              How much funding are you looking for? <span className="text-indigo-500">*</span>
              <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:bg-slate-900">
                <span className="mr-2 text-sm text-slate-500">₹</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.fundings}
                  onChange={(event) => updateField("fundings", event.target.value)}
                  placeholder="10,00,000"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Who are your competitors?
              <textarea
                value={form.competitors}
                onChange={(event) => updateField("competitors", event.target.value)}
                rows={3}
                placeholder="List known competitors or alternatives"
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            What makes your approach different?{" "}
            <span className="font-normal text-slate-400">(optional)</span>
            <textarea
              value={form.advantage}
              onChange={(event) => updateField("advantage", event.target.value)}
              rows={3}
              placeholder="Share any unique insight, technology, or unfair advantage..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900"
            />
          </label>
          <div className="flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center dark:border-slate-800">
            <p className="flex items-center gap-2 text-xs text-slate-400">
              <CircleHelp size={15} /> Your draft stays private until you
              publish it.
            </p>
            <button
              type="submit"
              disabled={!canAnalyze || isAnalyzing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
            >
              {isAnalyzing ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />{" "}
                  Analyzing...
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
    </>
  );
};

export default AnalyzeIdeaFrom;
