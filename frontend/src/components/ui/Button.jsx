const base =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.985]";

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-xl",
  md: "px-4 py-2 text-xs sm:text-[13px] rounded-xl",
  lg: "px-5 py-2.5 text-sm sm:text-base rounded-xl font-semibold",
};

const variants = {
  primary:
    "bg-accent-gradient text-white shadow-[0_6px_20px_-6px_rgba(124,58,237,0.55)] hover:shadow-[0_8px_26px_-6px_rgba(124,58,237,0.65)] hover:brightness-110 border border-transparent",
  gradient:
    "bg-accent-gradient text-white shadow-[0_6px_20px_-6px_rgba(124,58,237,0.55)] hover:shadow-[0_8px_26px_-6px_rgba(124,58,237,0.65)] hover:brightness-110 border border-transparent",
  secondary:
    "bg-[var(--bg-card-base)] text-[var(--text-secondary)] border border-[var(--border-mid)] hover:bg-[var(--row-hover)] hover:border-[var(--border-hot)] hover:text-[var(--text-primary)]",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:bg-[var(--row-hover)] hover:text-[var(--text-primary)] border border-transparent",
  danger:
    "border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40",
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
