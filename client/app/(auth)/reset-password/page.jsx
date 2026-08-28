"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/app/components/ui/themeToggle";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!uid || !token) {
      setError("This reset link is invalid or incomplete.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password-reset/confirm/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, token, new_password: password }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const firstError = Object.values(data)[0]?.[0] || "This reset link is invalid or has expired.";
        throw new Error(firstError);
      }

      setMessage("Password reset successfully. Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message);
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
          <ThemeToggle />
        </nav>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
                Account recovery
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Set a new password
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Choose a new password for your account.
              </p>
            </div>

            {!uid || !token ? (
              <p className="text-sm text-red-500">
                This reset link is invalid or incomplete. Please request a new one.
              </p>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirm-password">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
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
                  {loading ? "Resetting..." : "Reset password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}