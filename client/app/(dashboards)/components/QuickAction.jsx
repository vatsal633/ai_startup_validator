import React from 'react'
import Link from 'next/link';

const QuickAction = ({ href, icon, title, description}) => {
   return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-indigo-900 dark:hover:bg-slate-800"
    >

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="text-xs text-slate-400">
          {description}
        </p>

      </div>

      <span className="text-slate-400">
        →
      </span>

    </Link>
  );
}

export default QuickAction