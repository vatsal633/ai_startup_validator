// The Idea model's choice values, with the labels shown in the UI.
// Values must match ideas.models.Idea exactly — the API rejects anything else.

export const BUSINESS_MODELS = [
  { value: "subscription", label: "Subscription" },
  { value: "commission", label: "Commission" },
  { value: "one_time", label: "One-time purchase" },
  { value: "freemium", label: "Freemium" },
  { value: "advertising", label: "Advertising" },
  { value: "other", label: "Other" },
];

export const STAGES = [
  { value: "idea", label: "Just an idea" },
  { value: "prototype", label: "Prototype" },
  { value: "mvp", label: "MVP" },
  { value: "launched", label: "Launched" },
  { value: "revenue", label: "Generating revenue" },
];

export const STATUSES = [
  { value: "processing", label: "Processing" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
];

// industry is a free-text field server-side; these are just common starting points
export const INDUSTRIES = [
  "SaaS",
  "Fintech",
  "Healthtech",
  "AgriTech",
  "EdTech",
  "E-commerce",
  "Climate",
  "Other",
];

const labelLookup = (options) => (value) =>
  options.find((option) => option.value === value)?.label ?? value ?? "";

export const businessModelLabel = labelLookup(BUSINESS_MODELS);
export const stageLabel = labelLookup(STAGES);
export const statusLabel = labelLookup(STATUSES);

/** Tailwind classes per status, so badges look the same everywhere. */
export const STATUS_STYLES = {
  published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  processing: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
};

/** "₹25,00,000" from 2500000 — the backend prices everything in rupees. */
export function formatFunding(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
