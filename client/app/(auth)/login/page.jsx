
import Link from "next/link";
import ThemeToggle from "@/app/components/ui/themeToggle";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-8 lg:py-8">

        {/* ================= NAVBAR ================= */}
        <nav className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Venture<span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Back to home
          </Link>
          <ThemeToggle/>
        </nav>

        {/* ================= LOGIN CONTAINER ================= */}
        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 lg:grid-cols-[1.05fr_0.95fr]">

            {/* ================= LEFT PANEL ================= */}
            <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">

              {/* Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.35),_transparent_40%),linear-gradient(135deg,_#4338ca_0%,_#312e81_45%,_#111827_100%)]" />

              <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">

                <div>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                    <span>✦</span>
                    AI-Powered Startup Validation
                  </div>

                  <h1 className="mt-8 max-w-md text-4xl font-bold leading-tight">
                    Welcome back to your founder workspace.
                  </h1>

                  <p className="mt-4 max-w-md text-base leading-7 text-indigo-100">
                    Review startup insights, track opportunities, and continue
                    validating ideas with confidence.
                  </p>
                </div>

                {/* Benefits */}
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
                    Why founders love it
                  </p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-100">
                    <li>• Instant AI analysis for your startup idea</li>
                    <li>• Clear investor-ready summaries</li>
                    <li>• Private and public visibility controls</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ================= RIGHT PANEL ================= */}
            <section className="px-6 py-8 transition-colors sm:px-10 sm:py-10 lg:px-12 lg:py-12">

              {/* Header */}
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
                  Welcome back
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Sign in to VentureAI
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Access your dashboard, continue your analysis, and manage
                  startup opportunities.
                </p>
              </div>

              {/* ================= LOGIN FORM ================= */}
              <form className="space-y-5">

                {/* Email */}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    htmlFor="email"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                  />
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between text-sm">

                  <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                    />

                    Remember me
                  </label>

                  <Link
                    href="#"
                    className="font-medium text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-indigo-950/40"
                >
                  Sign in
                </button>
              </form>

              {/* ================= DIVIDER ================= */}
              <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

                <span>or continue with</span>

                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* ================= GOOGLE ================= */}
              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <span>G</span>
                Continue with Google
              </button>

              {/* ================= REGISTER ================= */}
              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                New here?{" "}

                <Link
                  href="/signin"
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Create an account
                </Link>
              </p>

            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

