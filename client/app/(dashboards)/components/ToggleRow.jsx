"use client"
import React,{useState} from "react";

export default function ToggleRow({
  title,
  description,
  defaultChecked,
}) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-100 py-5 last:border-0 dark:border-slate-800">

      <div>

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>

      </div>

      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-indigo-600"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}