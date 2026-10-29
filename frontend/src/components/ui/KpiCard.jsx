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
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    primary: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    danger: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  };

  const iconStyle = iconVariants[variant] || iconVariants.default;

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white pt-0.5">
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
        <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[200px]">
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
