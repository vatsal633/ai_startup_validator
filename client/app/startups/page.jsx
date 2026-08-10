import Link from "next/link";
import StartupCard from "../components/StartupCard";

const startups = [
  {
    id: 1,
    name: "FarmSense AI",
    tagline: "AI-powered crop disease detection for farmers",
    description:
      "A mobile platform that helps farmers detect crop diseases using AI-powered image analysis and provides actionable treatment recommendations.",
    category: "AgriTech",
    stage: "MVP",
    funding: "₹25 Lakh",
    score: 87,
    risk: "Medium",
    founders: "2 Founders",
    location: "Pune, India",
    tags: ["AI", "Agriculture", "Computer Vision"],
    trending: true,
  },
  {
    id: 2,
    name: "SkillBridge",
    tagline: "Connecting students with industry-ready skills",
    description:
      "An AI-powered platform that identifies skill gaps in students and creates personalized learning paths based on their career goals.",
    category: "EdTech",
    stage: "Early Stage",
    funding: "₹40 Lakh",
    score: 82,
    risk: "Low",
    founders: "3 Founders",
    location: "Bangalore, India",
    tags: ["AI", "Education", "Career"],
    trending: true,
  },
  {
    id: 3,
    name: "MediTrack",
    tagline: "Simplifying medication management",
    description:
      "A smart healthcare platform that helps patients manage prescriptions, medication schedules and doctor appointments.",
    category: "HealthTech",
    stage: "Prototype",
    funding: "₹15 Lakh",
    score: 76,
    risk: "Medium",
    founders: "2 Founders",
    location: "Mumbai, India",
    tags: ["Healthcare", "Mobile", "SaaS"],
    trending: false,
  },
  {
    id: 4,
    name: "GreenCart",
    tagline: "Making sustainable shopping easier",
    description:
      "A marketplace that connects consumers with sustainable and locally produced products while helping small businesses reach new customers.",
    category: "E-Commerce",
    stage: "MVP",
    funding: "₹30 Lakh",
    score: 79,
    risk: "Medium",
    founders: "3 Founders",
    location: "Delhi, India",
    tags: ["E-Commerce", "Sustainability", "Marketplace"],
    trending: false,
  },
  {
    id: 5,
    name: "FinMate",
    tagline: "Your AI personal finance companion",
    description:
      "An AI-powered personal finance assistant that analyzes spending patterns and provides personalized budgeting recommendations.",
    category: "FinTech",
    stage: "MVP",
    funding: "₹50 Lakh",
    score: 91,
    risk: "Low",
    founders: "2 Founders",
    location: "Hyderabad, India",
    tags: ["FinTech", "AI", "Finance"],
    trending: true,
  },
  {
    id: 6,
    name: "LocalChef",
    tagline: "Discover homemade food around you",
    description:
      "A platform connecting home chefs with customers looking for authentic homemade meals in their neighborhood.",
    category: "FoodTech",
    stage: "Idea",
    funding: "₹10 Lakh",
    score: 71,
    risk: "High",
    founders: "1 Founder",
    location: "Ahmedabad, India",
    tags: ["Food", "Marketplace", "Local"],
    trending: false,
  },
];

const categories = [
  "All",
  "AI",
  "FinTech",
  "HealthTech",
  "EdTech",
  "AgriTech",
  "E-Commerce",
];

export default function StartupPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">

          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            Venture<span className="text-indigo-600">AI</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-indigo-600"
            >
              Home
            </Link>

            <Link
              href="/startup"
              className="text-sm font-semibold text-indigo-600"
            >
              Explore Startups
            </Link>

            <Link
              href="/analyze"
              className="text-sm text-slate-500 hover:text-indigo-600"
            >
              Analyze Idea
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-4 py-2 text-sm font-medium text-slate-600 sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>

        </div>
      </nav>


      {/* HEADER */}
      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
              ✦ Startup Discovery
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Discover the next
              <span className="text-indigo-600"> big idea.</span>
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-500">
              Explore AI-validated startup ideas from founders around
              the world and discover opportunities worth investing in.
            </p>

          </div>


          {/* SEARCH */}
          <div className="mt-10 flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search startups, industries or technologies..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            <button className="h-12 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              ⚙ Filters
            </button>

          </div>

        </div>

      </section>


      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* CATEGORY FILTERS */}
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2">

          {categories.map((category, index) => (
            <button
              key={category}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                index === 0
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {category}
            </button>
          ))}

        </div>


        {/* TOP BAR */}
        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold">
              Featured Startups
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              126 startups discovered
            </p>
          </div>

          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none">
            <option>Recommended</option>
            <option>Highest Score</option>
            <option>Newest</option>
            <option>Funding Required</option>
          </select>

        </div>


        {/* STARTUP FEED */}
        <div className="space-y-5">

          {startups.map((startup) => (
            <StartupCard
              key={startup.id}
              startup={startup}
            />
          ))}

        </div>

      </section>


      {/* CTA */}
      <section className="border-t border-slate-200 bg-white px-6 py-20 text-center">

        <h2 className="text-3xl font-bold">
          Have a startup idea?
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-slate-500">
          Validate your idea with AI and get discovered by
          potential investors.
        </p>

        <Link
          href="/analyze"
          className="mt-7 inline-block rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Analyze Your Idea →
        </Link>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">

          <div className="font-bold">
            Venture<span className="text-indigo-600">AI</span>
          </div>

          <p className="text-sm text-slate-400">
            AI-powered startup validation & investor discovery
          </p>

          <p className="text-xs text-slate-400">
            © 2026 VentureAI
          </p>

        </div>

      </footer>

    </main>
  );
}