import React from 'react'
import Link from 'next/link';

const NavItem = ({href, icon, label, active, badge}) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      }`}
    >
      <span className="flex w-5 justify-center">
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>

      {badge && (
        <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default NavItem