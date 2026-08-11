const StatCard=({ icon, label, value, change })=> {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800">
          {icon}
        </div>

        <span className="text-xs font-medium text-emerald-600">
          {change}
        </span>

      </div>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}

export default StatCard