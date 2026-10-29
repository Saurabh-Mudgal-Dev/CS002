import React from "react";

const base =
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold";

const variants = {
  "in_stock": "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  "low_stock": "border-amber-500/30 bg-amber-500/10 text-amber-700",
  "critical": "border-rose-500/30 bg-rose-500/10 text-rose-700",
  "out_of_stock": "border-[var(--border-mid)] bg-[var(--bg-surface)] text-[var(--text-muted)]",
  default: "border-[var(--border-mid)] bg-transparent text-[var(--text-muted)]",
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

