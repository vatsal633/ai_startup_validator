"use client";
import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/app/components/ui/themeToggle";
import { login ,singIn} from "../apis/auth.api";

export default function SignInPage() {
  const [joinAs, setJoinAs] = useState("founder");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name:"",
    email: "",
    password: "",
  });

  const handleSubmint=async(e)=>{
    e.preventDefault()
    try {
      const res = await singIn(formData)
      console.log(res); 
      // console.log(formData);
      
    } catch (error) {
      console.log(error);
    }
  }

  const handleChange=(e)=>{
    const {name,value} = e.target
    setFormData((prev)=>({
      ...prev,
      [name]:value,
    }))
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-8 lg:py-8">
        {/* ================= NAVBAR ================= */}
        <nav className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Venture
            <span className="text-indigo-600 dark:text-indigo-400">AI</span>
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

        {/* ================= MAIN ================= */}
        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 lg:grid-cols-[1.05fr_0.95fr]">
            {/* ================= LEFT PANEL ================= */}
            <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.35),_transparent_40%),linear-gradient(135deg,_#4338ca_0%,_#312e81_45%,_#111827_100%)]" />

              <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                    <span>✦</span>
                    AI-Powered Startup Validation
                  </div>

                  <h1 className="mt-8 max-w-md text-4xl font-bold leading-tight">
                    Create your founder account.
                  </h1>

                  <p className="mt-4 max-w-md text-base leading-7 text-indigo-100">
                    Start analyzing ideas, building investor-ready profiles, and
                    discovering opportunities in one place.
                  </p>
                </div>

                {/* Features */}
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
                    Startup-ready features
                  </p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-100">
                    <li>• AI validation reports for every idea</li>
                    <li>• Private and public startup visibility</li>
                    <li>• Investor discovery and outreach tools</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ================= RIGHT PANEL ================= */}
            <section className="px-6 py-8 transition-colors sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              {/* Header */}
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
                  Create account
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Join VentureAI
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Create your account to begin validating startup ideas and
                  building your next opportunity.
                </p>
              </div>

              {/* ================= FORM ================= */}
              <form className="space-y-5">
                {/* First + Last Name */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                      htmlFor="first-name"
                    >
                      First name
                    </label>

                    <input
                      id="first-name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={e=>handleChange(e)}
                      type="text"
                      placeholder="Ava"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                      htmlFor="last-name"
                    >
                      Last name
                    </label>

                    <input
                      id="last-name"
                      type="text"
                      placeholder="Patel"
                      name="last_name"
                      value={formData.last_name}
                      onChange={e=>{handleChange(e)}}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    htmlFor="password"
                  >
                    Join as a
                  </label>
                  <select
                    name="joinAs"
                    id="join-as"
                    value={joinAs}
                    onChange={(e) => setJoinAs(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                    required
                  >
                    <option value="founder">Founder</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>

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
                    name="email"
                    value={formData.email}
                    onChange={e=>handleChange(e)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                    required
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
                    name="password"
                    value={formData.password}
                   onChange={e=>handleChange(e)}
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
                    required
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                  />

                  <span>I agree to the terms and privacy policy.</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-indigo-950/40"
                  onClickCapture={handleSubmint}    
                >
                  Create account
                </button>
              </form>

              {/* ================= LOGIN LINK ================= */}
              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Sign in
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
