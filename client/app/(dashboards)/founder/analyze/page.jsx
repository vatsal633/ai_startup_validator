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
import AnalyzeIdeaFrom from "../../components/forms/AnalyzeIdeaFrom";



const initialForm = {
	name: "",
	category: "SaaS",
	description: "",
	audience: "",
	advantage: "",
	target_country:"",
	business_model:"",
	startup_stage:"",
	fundings:"",
	competitors:""
};

export default function AnalyzePage() {
	const [form, setForm] = useState(initialForm);

	const [hasResult, setHasResult] = useState(false);

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
					<AnalyzeIdeaFrom/>
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
