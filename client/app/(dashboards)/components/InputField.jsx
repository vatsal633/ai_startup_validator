export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  hint,
  ...rest
}) {
  // controlled when onChange is supplied, uncontrolled otherwise
  const valueProps = onChange
    ? { value: value ?? "", onChange: (event) => onChange(event.target.value) }
    : { defaultValue: value };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...valueProps}
        {...rest}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950 dark:disabled:bg-slate-900"
      />

      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
