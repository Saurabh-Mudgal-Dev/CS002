const base =
  "inline-flex items-center rounded-full border font-semibold tracking-tight transition-colors";

const sizes = {
  sm: "px-2 py-0.5 text-[10px] tracking-wide",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-xs font-semibold",
};

/* Token-driven variants — designed to read well on dark violet and clean on light */
const variants = {
  default: "border-[var(--border-mid)] bg-[var(--row-hover)] text-[var(--text-secondary)]",
  primary: "border-[var(--badge-border)] bg-[var(--badge-bg)] text-[var(--badge-text)]",
  accent: "border-[var(--badge-border)] bg-[var(--badge-bg)] text-[var(--badge-text)]",
  info: "border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  danger: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  neutral: "border-[var(--border-mid)] bg-[var(--row-hover)] text-[var(--text-muted)]",
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
