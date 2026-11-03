const base =
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold";

const variants = {
  "in_stock": "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  "low_stock": "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  "critical": "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  "out_of_stock": "border-[var(--border-mid)] bg-[var(--row-hover)] text-[var(--text-muted)]",
  default: "border-[var(--border-mid)] bg-[var(--row-hover)] text-[var(--text-secondary)]",
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


