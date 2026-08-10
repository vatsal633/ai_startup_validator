import Image from "next/image";
import Link from "next/link";
import Metric from "./components/Metric";
import SectionHeading from "./components/SectionHeading";
import Step from "./components/Step";
import InfoBox from "./components/InfoBox";
import Feature from "./components/Feature";
import { Brain } from 'lucide-react';
import { FileChartPie } from 'lucide-react';
import { BriefcaseBusiness } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';



export default function Home() {
  return (
    <>
    
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* ================= NAVBAR ================= */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Venture<span className="text-indigo-600">AI</span>
          </Link>

          {/* Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#how-it-works"
              className="text-sm text-slate-600 transition hover:text-indigo-600"
            >
              How It Works
            </Link>

            <Link
              href="/startups"
              className="text-sm text-slate-600 transition hover:text-indigo-600"
            >
              Explore Startups
            </Link>

            <Link
              href="#investors"
              className="text-sm text-slate-600 transition hover:text-indigo-600"
            >
              For Investors
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:block"
            >
              Login
            </Link>

            <Link
              href="/signin"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-100/50 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          {/* Hero Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
              <span>✦</span>
              AI-Powered Startup Validation
            </div>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Turn your idea into
              <span className="text-indigo-600"> opportunity.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              Validate your startup idea with AI, understand its market
              potential, and connect with investors looking for the next big
              opportunity.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/analyze"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Analyze Your Idea →
              </Link>

              <Link
                href="/startups"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Explore Startups
              </Link>
            </div>

            {/* Trust */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["👨🏻", "👩🏻", "👨🏽", "👩🏽"].map((avatar, index) => (
                  <div
                    key={index}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-sm"
                  >
                    {avatar}
                  </div>
                ))}
              </div>

              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">500+</span>{" "}
                startup ideas analyzed
              </p>
            </div>
          </div>

          {/* ================= AI REPORT CARD ================= */}
          <div className="relative">
            {/* Floating card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wider text-slate-400">
                    AI VALIDATION REPORT
                  </p>

                  <h3 className="mt-2 text-xl font-bold">SmartFarm AI</h3>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                  ● Analyzed
                </span>
              </div>

              {/* Score */}
              <div className="mt-8 flex items-center gap-6">
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[10px] border-indigo-500 bg-indigo-50">
                  <span className="text-3xl font-bold">84</span>

                  <span className="text-xs text-slate-400">/100</span>
                </div>

                <div>
                  <h4 className="font-bold">Strong Potential</h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Your startup shows strong market opportunity with moderate
                    competition.
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="mt-8 space-y-5">
                <Metric name="Market Potential" value="High" percentage="85%" />

                <Metric name="Competition" value="Medium" percentage="60%" />

                <Metric
                  name="Business Feasibility"
                  value="High"
                  percentage="78%"
                />
              </div>

              {/* Recommendation */}
              <div className="mt-7 rounded-xl bg-indigo-50 p-4">
                <p className="text-xs font-bold text-indigo-600">
                  💡 AI RECOMMENDATION
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Focus on small and medium-sized farms during your initial
                  launch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="WHY VENTURE AI"
            title={
              <>
                From idea to opportunity,
                <br />
                all in one place.
              </>
            }
          />

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Brain/>}
              title="AI Idea Validation"
              description="Get an AI-powered analysis of your startup idea, market potential, competition and risks."
            />

            <Feature
              icon={<FileChartPie/>}
              title="Detailed Insights"
              description="Understand your customers, business model, opportunities and potential challenges."
            />

            <Feature
              icon={<BriefcaseBusiness/>}
              title="Find Investors"
              description="Publish your startup and connect with investors interested in your industry."
            />

            <Feature
              icon={<ShieldCheck/>}
              title="Controlled Disclosure"
              description="Keep sensitive business information private and decide who can access it."
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="bg-slate-50 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="HOW IT WORKS"
            title={
              <>
                From idea to investor
                <br />
                in four simple steps.
              </>
            }
          />

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            <Step
              number="01"
              title="Submit Your Idea"
              description="Tell us about your startup, target audience, industry and funding requirements."
            />

            <Step
              number="02"
              title="AI Analysis"
              description="Our AI evaluates your idea and generates a structured startup validation report."
            />

            <Step
              number="03"
              title="Publish"
              description="Publish a public version of your startup while keeping sensitive information private."
            />

            <Step
              number="04"
              title="Connect"
              description="Investors discover your startup and request access to additional information."
            />
          </div>
        </div>
      </section>

      {/* ================= INVESTOR SECTION ================= */}
      <section id="investors" className="bg-white px-6 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold tracking-widest text-indigo-600">
              FOR INVESTORS
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Discover the next
              <span className="text-indigo-600"> big idea.</span>
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Explore AI-validated startups, filter opportunities by industry
              and funding requirements, and connect directly with founders.
            </p>

            <Link
              href="/startups"
              className="mt-8 inline-block rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Explore Startups →
            </Link>
          </div>

          {/* Investor Card */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">FEATURED STARTUP</p>

                  <h3 className="mt-2 text-xl font-bold">AI Resume Platform</h3>
                </div>

                <span className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-600">
                  82/100
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <InfoBox label="Industry" value="EdTech" />

                <InfoBox label="Funding" value="₹20L" />

                <InfoBox label="Risk" value="Medium" />
              </div>

              <button className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                View Startup
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-slate-900 px-6 py-28 text-center text-white">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Have an idea?
          <br />
           <span className="text-indigo-400">Let&apos;s validate it.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-slate-400">
          Find out whether your idea has what it takes to become the next big
          thing.
        </p>

        <Link
          href="/analyze"
          className="mt-8 inline-block rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Analyze My Idea →
        </Link>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <div className="text-xl font-bold">
                Venture<span className="text-indigo-600">AI</span>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                AI-powered startup validation and investor discovery.
              </p>
            </div>

            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="#">About</Link>
              <Link href="#">Privacy</Link>
              <Link href="#">Terms</Link>
              <Link href="#">Contact</Link>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            © 2026 VentureAI. Academic project.
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
