import React from "react";
import Link from "next/link";
import NavItem from "./NavItem";

const Sidebar = ({ activeTab }) => {
    const navitems = [
        {label:"dashboard",hred:"founder/dashboard",icon:"⌂",isActive:true},
        {label:"my ideas",hred:"founder/ideas",icon:"💡",isActive:false},
        {label:"analyze my idea",hred:"founder/analyze",icon:"✦",isActive:false},
        {label:"my analytics",hred:"founder/analytics",icon:"◔",isActive:false},
        
    ];


  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-4">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
              V
            </div>

            <span className="text-lg font-bold">
              Venture<span className="text-indigo-600">AI</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            <NavItem
              href="/founder/dashboard"
              icon="⌂"
              label="Dashboard"
              active
            />

            <NavItem href="/founder/startups" icon="💡" label="My Ideas" />

            <NavItem href="/founder/analyze" icon="✦" label="Analyze Idea" />

            <NavItem href="/dashboard/analytics" icon="◔" label="Analytics" />

            <NavItem
              href="/founder/requests"
              icon="💰"
              label="Investor Requests"
              badge="4"
            />
          </nav>

          <div className="my-6 border-t border-slate-200 dark:border-slate-800" />

          <nav className="space-y-1">
            <NavItem
              href="/founder/notifications"
              icon="🔔"
              label="Notifications"
            />

            <NavItem href="/founder/settings" icon="⚙" label="Settings" />
          </nav>

          {/* Bottom CTA */}
          <div className="mt-auto rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
              Have another idea?
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-600 dark:text-indigo-400">
              Let AI validate your next business idea.
            </p>

            <Link
              href="/analyze"
              className="mt-3 block rounded-lg bg-indigo-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Analyze Idea →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
