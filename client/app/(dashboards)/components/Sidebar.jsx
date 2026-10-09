"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavItem from "./NavItem";

// One entry per role, so the two navs can't drift apart the way they had.
const NAV = {
  founder: {
    primary: [
      { href: "/founder/dashboard", icon: "⌂", label: "Dashboard" },
      { href: "/founder/myideas", icon: "💡", label: "My Ideas" },
      { href: "/founder/analyze", icon: "✦", label: "Analyze Idea" },
      { href: "/founder/requests", icon: "💰", label: "Investor Requests" },
    ],
    cta: {
      title: "Have another idea?",
      body: "Let AI validate your next business idea.",
      href: "/founder/analyze",
      label: "Analyze Idea →",
    },
  },
  investor: {
    primary: [
      { href: "/investor/dashboard", icon: "⌂", label: "Dashboard" },
      { href: "/startups", icon: "💡", label: "Discover Startups" },
      { href: "/investor/requests", icon: "💰", label: "My Requests" },
    ],
    cta: {
      title: "Looking for your next bet?",
      body: "Browse validated startups across every industry.",
      href: "/startups",
      label: "Discover Startups →",
    },
  },
};

const Sidebar = ({ role = "founder", unreadCount = 0 }) => {
  const pathname = usePathname();
  const config = NAV[role] ?? NAV.founder;

  const secondary = [
    {
      href: `/${role}/notifications`,
      icon: "🔔",
      label: "Notifications",
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
    { href: `/${role}/settings`, icon: "⚙", label: "Settings" },
  ];

  // exact match, or a deeper page inside that section
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-4">
        <Link href="/" className="mb-8 flex items-center gap-3 px-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
            V
          </div>
          <span className="text-lg font-bold">
            Venture<span className="text-indigo-600">AI</span>
          </span>
        </Link>

        <nav className="space-y-1">
          {config.primary.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>

        <div className="my-6 border-t border-slate-200 dark:border-slate-800" />

        <nav className="space-y-1">
          {secondary.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>

        <div className="mt-auto rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
            {config.cta.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-indigo-600 dark:text-indigo-400">
            {config.cta.body}
          </p>
          <Link
            href={config.cta.href}
            className="mt-3 block rounded-lg bg-indigo-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-indigo-700"
          >
            {config.cta.label}
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
