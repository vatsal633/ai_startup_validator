"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { getRole, isAuthenticated } from "@/lib/auth";

const FOUNDER_ANALYZE = "/founder/analyze";

/**
 * The landing page's "Analyze your idea" call to action.
 *
 * The landing page is a server component and cannot read the session, so it
 * links here and this page decides: founders go straight to the form,
 * signed-out visitors go and sign in first, and anyone whose role cannot
 * submit an idea is told so rather than silently redirected somewhere odd.
 */
export default function AnalyzeEntryPage() {
  const router = useRouter();
  const [role, setRole] = useState(undefined); // undefined while deciding

  useEffect(() => {
    if (!isAuthenticated()) {
      // come back here after signing in, rather than dumping them on a dashboard
      router.replace(`/login?next=${encodeURIComponent(FOUNDER_ANALYZE)}`);
      return;
    }

    const current = getRole();
    if (current === "founder") {
      router.replace(FOUNDER_ANALYZE);
      return;
    }

    setRole(current);
  }, [router]);

  if (role === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoaderCircle size={26} className="animate-spin text-indigo-600" />
      </main>
    );
  }

  const home = role === "investor" ? "/investor/dashboard" : "/admin/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold">Submitting ideas is for founders</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          You&apos;re signed in as {role === "investor" ? "an investor" : "an admin"},
          so there&apos;s no idea form on your account. Browse what founders have
          already published instead.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/startups"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Discover startups
          </Link>
          <Link
            href={home}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            My dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
