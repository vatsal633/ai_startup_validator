import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Venture<span className="text-indigo-600">AI</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            Back to home
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.35),_transparent_40%),linear-gradient(135deg,_#4338ca_0%,_#312e81_45%,_#111827_100%)]" />

              <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                    <span>✦</span>
                    AI-Powered Startup Validation
                  </div>

                  <h1 className="mt-8 max-w-md text-4xl font-bold leading-tight">
                    Welcome back to your founder workspace.
                  </h1>

                  <p className="mt-4 max-w-md text-base leading-7 text-indigo-100">
                    Review startup insights, track opportunities, and continue validating ideas with confidence.
                  </p>
                </div>

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

            <section className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">
                  Welcome back
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  Sign in to VentureAI
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Access your dashboard, continue your analysis, and manage startup opportunities.
                </p>
              </div>

              <form className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-500">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    Remember me
                  </label>
                  <Link href="#" className="font-medium text-indigo-600 transition hover:text-indigo-700">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                >
                  Sign in
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span>or continue with</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <span>G</span>
                Continue with Google
              </button>

              <p className="mt-6 text-center text-sm text-slate-600">
                New here?{' '}
                <Link href="/register" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
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
