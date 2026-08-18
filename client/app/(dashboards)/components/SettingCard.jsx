export default function SettingsCard({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">

      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">

        <h2 className="text-lg font-bold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>

      </div>

      <div className="pt-6">
        {children}
      </div>

    </section>
  );
}
