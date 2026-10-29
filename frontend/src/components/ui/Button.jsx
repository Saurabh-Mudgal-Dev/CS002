const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-xl",
  md: "px-4 py-2 text-xs sm:text-sm rounded-xl",
  lg: "px-5 py-2.5 text-sm sm:text-base rounded-xl font-semibold",
};

const variants = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-xs hover:shadow-sm border border-transparent",
  gradient:
    "bg-[var(--accent-gradient)] text-white shadow-xs hover:shadow-md border border-transparent",
  secondary:
    "bg-[var(--bg-surface-elev)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--row-hover)] hover:text-[var(--text-primary)] shadow-2xs",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:bg-[var(--row-hover)] hover:text-[var(--text-primary)] border border-transparent",
  danger:
    "bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100/80 dark:hover:bg-rose-900/50",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  type = "button",
  ...rest
}) {
  const sizeClass = sizes[size] || sizes.md;
  const variantClass = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${sizeClass} ${variantClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-current" />
          </span>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
