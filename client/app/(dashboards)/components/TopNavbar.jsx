import React from "react";
import ThemeToggle from "@/app/components/ui/themeToggle";

const TopNavbar = ({header}) => {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              V
            </div>

            <span className="font-bold">
              Venture<span className="text-indigo-600">AI</span>
            </span>
          </div>

          <div className="hidden lg:block">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Founder {header}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
              🔔
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                V
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold">Founder</p>
                <p className="text-xs text-slate-400">Founder Account</p>
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNavbar;
