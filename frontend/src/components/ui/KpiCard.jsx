import Badge from "./Badge";

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className = ""
}) {
  const iconVariants = {
    default: "bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-secondary)] border border-[var(--border-subtle)]",
    primary: "bg-[var(--badge-bg)] text-[var(--accent)] dark:bg-[var(--badge-bg)] dark:text-[var(--badge-text)] border border-[var(--badge-border)]",
    success: "bg-emerald-50/70 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    warning: "bg-amber-50/70 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    danger: "bg-rose-50/70 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
  };

  const iconStyle = iconVariants[variant] || iconVariants.default;

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_6px_24px_-4px_rgba(25,22,46,0.05)] flex flex-col justify-between transition-all hover:border-[var(--border-hot)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-[var(--text-primary)] pt-0.5">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${iconStyle}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)] text-[11px] truncate max-w-[200px]">
          {subtitle || "Current live indicator"}
        </span>
        {trend && (
          <Badge variant={variant === "danger" ? "danger" : "primary"} size="sm">
            {trend}
          </Badge>
        )}
      </div>
    </div>
  );
}
