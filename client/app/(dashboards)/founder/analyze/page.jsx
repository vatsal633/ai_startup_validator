"use client";

import { useState } from "react";
import Link from "next/link";
import {
	ArrowRight,
	BarChart3,
	Check,
	ChevronDown,
	CircleHelp,
	Lightbulb,
	LoaderCircle,
	Sparkles,
	Target,
	TrendingUp,
} from "lucide-react";

const categories = ["SaaS", "Fintech", "Healthtech", "E-commerce", "Climate", "Other"];

const initialForm = {
	name: "",
	category: "SaaS",
	description: "",
	audience: "",
	advantage: "",
};

export default function AnalyzePage() {
	const [form, setForm] = useState(initialForm);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [hasResult, setHasResult] = useState(false);

	const updateField = (field, value) => {
		setForm((current) => ({ ...current, [field]: value }));
		setHasResult(false);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		setIsAnalyzing(true);
		window.setTimeout(() => {
			setIsAnalyzing(false);
			setHasResult(true);
		}, 900);
	};

	const canAnalyze = form.name.trim() && form.description.trim() && form.audience.trim();

	return (
		<main className="min-w-0 flex-1 bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
			<div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
				<section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
							AI validation studio
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Analyze your next big idea</h1>
						<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
							Turn an early thought into a sharper opportunity with an evidence-led validation report.
						</p>
					</div>
					<Link href="/founder/myideas" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
						View previous analyses <ArrowRight size={16} />
					</Link>
				</section>

				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
					<form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
						<div className="border-b border-slate-200 px-5 py-5 sm:px-7 dark:border-slate-800">
							<div className="flex items-start gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
									<Lightbulb size={20} />
								</div>
								<div>
									<h2 className="font-bold">Tell us about the idea</h2>
									<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A few focused details are all we need to get started.</p>
								</div>
							</div>
						</div>

						<div className="space-y-6 px-5 py-6 sm:px-7">
							<div className="grid gap-5 sm:grid-cols-[1fr_190px]">
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
									Idea name <span className="text-indigo-500">*</span>
									<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="e.g. FarmSense AI" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900" />
								</label>
								<label className="relative block text-sm font-medium text-slate-700 dark:text-slate-300">
									Industry
									<select value={form.category} onChange={(event) => updateField("category", event.target.value)} className="mt-2 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950">
										{categories.map((category) => <option key={category}>{category}</option>)}
									</select>
									<ChevronDown size={16} className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400" />
								</label>
							</div>

							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
								What problem does it solve? <span className="text-indigo-500">*</span>
								<textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} rows={5} placeholder="Describe the problem, your proposed solution, and why it matters..." className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900" />
							</label>

							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
								Who is it for? <span className="text-indigo-500">*</span>
								<input required value={form.audience} onChange={(event) => updateField("audience", event.target.value)} placeholder="e.g. Independent farmers managing 10-50 acres" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900" />
							</label>

							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
								What makes your approach different? <span className="font-normal text-slate-400">(optional)</span>
								<textarea value={form.advantage} onChange={(event) => updateField("advantage", event.target.value)} rows={3} placeholder="Share any unique insight, technology, or unfair advantage..." className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900" />
							</label>

							<div className="flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center dark:border-slate-800">
								<p className="flex items-center gap-2 text-xs text-slate-400"><CircleHelp size={15} /> Your draft stays private until you publish it.</p>
								<button type="submit" disabled={!canAnalyze || isAnalyzing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700">
									{isAnalyzing ? <><LoaderCircle size={17} className="animate-spin" /> Analyzing...</> : <><Sparkles size={17} /> Generate analysis</>}
								</button>
							</div>
						</div>
					</form>

					<aside className="space-y-6">
						<div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm dark:bg-indigo-950/60">
							<div className="flex items-center justify-between">
								<span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">What you get</span>
								<Sparkles size={20} className="text-indigo-300" />
							</div>
							<h2 className="mt-5 text-xl font-bold leading-7">A clearer path from idea to action.</h2>
							<div className="mt-6 space-y-5">
								{[{ icon: Target, title: "Market opportunity", text: "Understand demand and the audience you can win." }, { icon: BarChart3, title: "Competitive signal", text: "See where your concept stands in the market." }, { icon: TrendingUp, title: "Next best moves", text: "Get practical steps to strengthen your idea." }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><div className="mt-0.5 text-indigo-300"><Icon size={18} /></div><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div></div>)}
							</div>
						</div>

						<div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
							<div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"><Check size={16} /></div><h2 className="font-bold">Good to know</h2></div>
							{hasResult ? <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">Your preview is ready. This idea has a promising starting signal based on the details provided.</p> : <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">The more specific your problem and audience, the more useful your validation report will be.</p>}
							<div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full bg-emerald-500 transition-all duration-700 ${hasResult ? "w-full" : "w-1/3"}`} /></div>
							<p className="mt-2 text-xs text-slate-400">{hasResult ? "Analysis preview complete" : "Ready when you are"}</p>
						</div>
					</aside>
				</div>
			</div>
		</main>
	);
}
