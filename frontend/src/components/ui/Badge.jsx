import React from "react";

const base =
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors";

const variants = {
  default: "border-[var(--border-mid)] bg-transparent text-[var(--text-muted)]",
  accent: "border-[var(--badge-border)] bg-[var(--badge-bg)] text-[var(--badge-text)]",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-700",
};

export default function Badge({ children, className = "", variant = "default" }) {
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>
  );
}

