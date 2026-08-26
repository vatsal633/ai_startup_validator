"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/app/components/ui/themeToggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setMessage(`Password reset link sent to ${email}`);
      setEmail("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Venture<span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              Back to home
            </Link>
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.35),_transparent_40%),linear-gradient(135deg,_#4338ca_0%,_#312e81_45%,_#111827_100%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                    <span>✦</span>
                    Secure account recovery
                  </div>
                  <h1 className="mt-8 max-w-md text-4xl font-bold leading-tight">
                    Reset access to your workspace.
                  </h1>
                  <p className="mt-4 max-w-md text-base leading-7 text-indigo-100">
                    We’ll send a secure reset link so you can get back to analyzing ideas,
                    tracking investments, and managing your startup pipeline.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
                    Recovery steps
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-100">
                    <li>• Enter the email linked to your account</li>
                    <li>• Receive a secure magic link</li>
                    <li>• Create a new password in seconds</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="px-6 py-8 transition-colors sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
                  Account recovery
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Forgot your password?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  No worries — enter your email and we’ll send a reset link to get you
                  back in.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-indigo-950/40"
                >
                  {loading ? "Sending reset link..." : "Send reset link"}
                </button>
              </form>

              <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-300">Remembered your password?</span>
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Log In
                </Link>
              </div>

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