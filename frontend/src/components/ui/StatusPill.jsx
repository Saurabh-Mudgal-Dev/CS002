const base =
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold";

const variants = {
  "in_stock": "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300",
  "low_stock": "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300",
  "critical": "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300",
  "out_of_stock": "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] dark:bg-[var(--bg-surface-elev)] border-[var(--border-subtle)] dark:text-[var(--text-dim)]",
  default: "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:bg-[var(--bg-surface-elev)] border-[var(--border-subtle)] dark:text-[var(--text-dim)]",
};

export default function StatusPill({ status, className = "" }) {
  const key = String(status || "default")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  return (
    <span className={`${base} ${variants[key] || variants.default} ${className}`}>
      {status}
    </span>
  );
}


