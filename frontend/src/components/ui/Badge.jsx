const base =
  "inline-flex items-center rounded-full border font-medium transition-colors";

const sizes = {
  sm: "px-2 py-0.5 text-[10px] tracking-wide",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-xs font-semibold",
};

const variants = {
  default: "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:border-[var(--border-subtle)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-secondary)]",
  primary: "border-[var(--badge-border)] bg-[var(--badge-bg)] text-[var(--accent)] dark:border-[var(--badge-border)] dark:bg-[var(--badge-bg)] dark:text-[var(--badge-text)]",
  accent: "border-[var(--badge-border)] bg-[var(--badge-bg)] text-[var(--accent)] dark:border-[var(--badge-border)] dark:bg-[var(--badge-bg)] dark:text-[var(--badge-text)]",
  info: "border-sky-200/60 bg-sky-50/70 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-400",
  success: "border-emerald-200/60 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400",
  warning: "border-amber-200/60 bg-amber-50/70 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400",
  danger: "border-rose-200/60 bg-rose-50/70 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400",
  neutral: "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] dark:border-[var(--border-subtle)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-muted)]",
};

export default function Badge({
  children,
  className = "",
  variant = "default",
  size = "md"
}) {
  const sizeClass = sizes[size] || sizes.md;
  const variantClass = variants[variant] || variants.default;

  return (
    <span className={`${base} ${sizeClass} ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
